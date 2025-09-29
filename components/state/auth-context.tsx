"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type React from "react"

import { nanoid } from "nanoid"

type SubmissionStatus = "pending" | "approved" | "rejected"

export type User = {
  email: string
  password: string
  name: string
  profilePhoto: string
  points: number
  visitedTaskIds: string[]
}

export type TaskCategory = "Preliminary" | "Ignite Propel" | "Venture Quest" | "Comprehensive"

export type Task = {
  id: string
  title: string
  details: string
  image: string
  points: number
  status: "draft" | "published"
  category: TaskCategory
}

export type Submission = {
  id: string
  taskId: string
  userEmail: string
  fileName: string
  dataUrl: string
  status: SubmissionStatus
  createdAt: number
}

export type Update = {
  id: string
  title: string
  details: string
  createdAt: number
}

type AppData = {
  users: User[]
  tasks: Task[]
  submissions: Submission[]
  updates: Update[]
}

type AuthState = {
  currentUserEmail: string | null
}

type Ctx = {
  data: AppData
  currentUser: User | null
  isAdmin: boolean
  login: (email: string, password: string) => { ok: boolean; message?: string }
  logout: () => void
  publishTask: (payload: Omit<Task, "id" | "status">) => void
  deleteTask: (id: string) => void
  submitTask: (taskId: string, file: File) => Promise<{ ok: boolean; message?: string }>
  setVisited: (taskId: string) => void
  approveSubmission: (submissionId: string) => void
  rejectSubmission: (submissionId: string) => void
  publishUpdate: (payload: Omit<Update, "id" | "createdAt">) => void
  deleteUpdate: (id: string) => void
}

const AppContext = createContext<Ctx | null>(null)

const STORAGE_KEY = "neon-tasks-app"

const initialUsers: User[] = [
  {
    email: "11@11.com",
    password: "123",
    name: "Alex Carter",
    profilePhoto: "/placeholder-user.jpg",
    points: 0,
    visitedTaskIds: [],
  },
  {
    email: "22@22.com",
    password: "123",
    name: "Jordan Lee",
    profilePhoto: "/placeholder-user.jpg",
    points: 0,
    visitedTaskIds: [],
  },
  {
    email: "33@33.com",
    password: "123",
    name: "Taylor Morgan",
    profilePhoto: "/placeholder-user.jpg",
    points: 0,
    visitedTaskIds: [],
  },
  // Admin (points not used, no tasks submission expected)
  {
    email: "admin@admin.com",
    password: "123",
    name: "Admin",
    profilePhoto: "/placeholder-user.jpg",
    points: 0,
    visitedTaskIds: [],
  },
]

const initialData: AppData = {
  users: initialUsers,
  tasks: [],
  submissions: [],
  updates: [],
}

function readStorage(): { auth: AuthState; data: AppData } {
  if (typeof window === "undefined") {
    return { auth: { currentUserEmail: null }, data: initialData }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { auth: { currentUserEmail: null }, data: initialData }
    const parsed = JSON.parse(raw) as { auth: AuthState; data: AppData }
    // defensive defaults and migration for existing tasks without category
    const data = parsed?.data ?? initialData
    const migratedTasks = data.tasks.map(task => ({
      ...task,
      category: task.category || "Preliminary" as TaskCategory
    }))
    
    return {
      auth: parsed?.auth ?? { currentUserEmail: null },
      data: { ...data, tasks: migratedTasks },
    }
  } catch {
    return { auth: { currentUserEmail: null }, data: initialData }
  }
}

function writeStorage(auth: AuthState, data: AppData) {
  if (typeof window === "undefined") return
  const payload = JSON.stringify({ auth, data })
  window.localStorage.setItem(STORAGE_KEY, payload)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ auth, data }, setState] = useState(() => readStorage())

  useEffect(() => {
    writeStorage(auth, data)
  }, [auth, data])

  const currentUser = useMemo(
    () => data.users.find((u) => u.email === auth.currentUserEmail) ?? null,
    [auth.currentUserEmail, data.users],
  )

  const isAdmin = currentUser?.email === "admin@admin.com"

  const login: Ctx["login"] = useCallback(
    (email, password) => {
      const user = data.users.find((u) => u.email === email && u.password === password)
      if (!user) return { ok: false, message: "Invalid credentials" }
      setState((prev) => ({ ...prev, auth: { currentUserEmail: user.email } }))
      return { ok: true }
    },
    [data.users],
  )

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, auth: { currentUserEmail: null } }))
  }, [])

  const publishTask: Ctx["publishTask"] = useCallback((payload) => {
    const newTask: Task = {
      id: nanoid(),
      title: payload.title,
      details: payload.details,
      image: payload.image,
      points: payload.points,
      status: "published",
      category: payload.category,
    }
    setState((prev) => ({ ...prev, data: { ...prev.data, tasks: [newTask, ...prev.data.tasks] } }))
  }, [])

  const deleteTask: Ctx["deleteTask"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        tasks: prev.data.tasks.filter((t) => t.id !== id),
        submissions: prev.data.submissions.filter((s) => s.taskId !== id),
      },
    }))
  }, [])

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const submitTask: Ctx["submitTask"] = useCallback(
    async (taskId, file) => {
      if (!currentUser) return { ok: false, message: "Not logged in" }
      const dataUrl = await fileToDataUrl(file)
      const sub: Submission = {
        id: nanoid(),
        taskId,
        userEmail: currentUser.email,
        fileName: file.name,
        dataUrl,
        status: "pending",
        createdAt: Date.now(),
      }
      setState((prev) => ({
        ...prev,
        data: { ...prev.data, submissions: [sub, ...prev.data.submissions] },
      }))
      return { ok: true }
    },
    [currentUser],
  )

  const setVisited: Ctx["setVisited"] = useCallback(
    (taskId) => {
      if (!currentUser) return
      setState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          users: prev.data.users.map((u) =>
            u.email === currentUser.email && !u.visitedTaskIds.includes(taskId)
              ? { ...u, visitedTaskIds: [...u.visitedTaskIds, taskId] }
              : u,
          ),
        },
      }))
    },
    [currentUser],
  )

  const approveSubmission: Ctx["approveSubmission"] = useCallback((submissionId) => {
    setState((prev) => {
      const submission = prev.data.submissions.find((s) => s.id === submissionId)
      if (!submission) return prev
      const task = prev.data.tasks.find((t) => t.id === submission.taskId)
      if (!task) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          submissions: prev.data.submissions.map((s) => (s.id === submissionId ? { ...s, status: "approved" } : s)),
          users: prev.data.users.map((u) =>
            u.email === submission.userEmail ? { ...u, points: u.points + task.points } : u,
          ),
        },
      }
    })
  }, [])

  const rejectSubmission: Ctx["rejectSubmission"] = useCallback((submissionId) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        submissions: prev.data.submissions.map((s) => (s.id === submissionId ? { ...s, status: "rejected" } : s)),
      },
    }))
  }, [])

  const publishUpdate: Ctx["publishUpdate"] = useCallback((payload) => {
    const newUpdate: Update = {
      id: nanoid(),
      title: payload.title,
      details: payload.details,
      createdAt: Date.now(),
    }
    setState((prev) => ({ ...prev, data: { ...prev.data, updates: [newUpdate, ...(prev.data.updates || [])] } }))
  }, [])

  const deleteUpdate: Ctx["deleteUpdate"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        updates: (prev.data.updates || []).filter((u) => u.id !== id),
      },
    }))
  }, [])

  const value: Ctx = {
    data,
    currentUser,
    isAdmin: !!isAdmin,
    login,
    logout,
    publishTask,
    deleteTask,
    submitTask,
    setVisited,
    approveSubmission,
    rejectSubmission,
    publishUpdate,
    deleteUpdate,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AuthProvider")
  return ctx
}
