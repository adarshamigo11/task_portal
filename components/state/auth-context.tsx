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

export type Campaign = {
  id: string
  name: string
  description: string
  createdAt: number
}

export type Category = {
  id: string
  name: string
  campaignId: string
  createdAt: number
}

export type Task = {
  id: string
  title: string
  details: string
  image: string
  points: number
  status: "draft" | "published"
  categoryId: string
  campaignId: string
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
  campaigns: Campaign[]
  categories: Category[]
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
  createCampaign: (payload: Omit<Campaign, "id" | "createdAt">) => void
  createCategory: (payload: Omit<Category, "id" | "createdAt">) => void
  publishTask: (payload: Omit<Task, "id" | "status">) => void
  editCampaign: (id: string, payload: Omit<Campaign, "id" | "createdAt">) => void
  editCategory: (id: string, payload: Omit<Category, "id" | "createdAt">) => void
  editTask: (id: string, payload: Omit<Task, "id" | "status">) => void
  deleteCampaign: (id: string) => void
  deleteCategory: (id: string) => void
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
  campaigns: [],
  categories: [],
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
    // defensive defaults and migration for existing data
    const data = parsed?.data ?? initialData
    
    // Migrate old tasks to new structure if needed
    const migratedTasks = (data.tasks || []).map(task => ({
      ...task,
      categoryId: task.categoryId || "default-category",
      campaignId: task.campaignId || "default-campaign"
    }))
    
    return {
      auth: parsed?.auth ?? { currentUserEmail: null },
      data: { 
        ...initialData,
        ...data,
        campaigns: data.campaigns || [],
        categories: data.categories || [],
        tasks: migratedTasks,
        updates: data.updates || []
      },
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

  const createCampaign: Ctx["createCampaign"] = useCallback((payload) => {
    const newCampaign: Campaign = {
      id: nanoid(),
      name: payload.name,
      description: payload.description,
      createdAt: Date.now(),
    }
    setState((prev) => ({ ...prev, data: { ...prev.data, campaigns: [newCampaign, ...(prev.data.campaigns || [])] } }))
  }, [])

  const createCategory: Ctx["createCategory"] = useCallback((payload) => {
    const newCategory: Category = {
      id: nanoid(),
      name: payload.name,
      campaignId: payload.campaignId,
      createdAt: Date.now(),
    }
    setState((prev) => ({ ...prev, data: { ...prev.data, categories: [newCategory, ...(prev.data.categories || [])] } }))
  }, [])

  const publishTask: Ctx["publishTask"] = useCallback((payload) => {
    const newTask: Task = {
      id: nanoid(),
      title: payload.title,
      details: payload.details,
      image: payload.image,
      points: payload.points,
      status: "published",
      categoryId: payload.categoryId,
      campaignId: payload.campaignId,
    }
    setState((prev) => ({ ...prev, data: { ...prev.data, tasks: [newTask, ...(prev.data.tasks || [])] } }))
  }, [])

  const editCampaign: Ctx["editCampaign"] = useCallback((id, payload) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        campaigns: (prev.data.campaigns || []).map((c) => 
          c.id === id ? { ...c, name: payload.name, description: payload.description } : c
        ),
      },
    }))
  }, [])

  const editCategory: Ctx["editCategory"] = useCallback((id, payload) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        categories: (prev.data.categories || []).map((cat) => 
          cat.id === id ? { ...cat, name: payload.name, campaignId: payload.campaignId } : cat
        ),
      },
    }))
  }, [])

  const editTask: Ctx["editTask"] = useCallback((id, payload) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        tasks: (prev.data.tasks || []).map((t) => 
          t.id === id ? { 
            ...t, 
            title: payload.title, 
            details: payload.details, 
            image: payload.image, 
            points: payload.points,
            categoryId: payload.categoryId,
            campaignId: payload.campaignId
          } : t
        ),
      },
    }))
  }, [])

  const deleteCampaign: Ctx["deleteCampaign"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        campaigns: (prev.data.campaigns || []).filter((c) => c.id !== id),
        categories: (prev.data.categories || []).filter((cat) => cat.campaignId !== id),
        tasks: (prev.data.tasks || []).filter((t) => t.campaignId !== id),
        submissions: (prev.data.submissions || []).filter((s) => {
          const task = prev.data.tasks.find(t => t.id === s.taskId)
          return task && task.campaignId !== id
        }),
      },
    }))
  }, [])

  const deleteCategory: Ctx["deleteCategory"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        categories: (prev.data.categories || []).filter((cat) => cat.id !== id),
        tasks: (prev.data.tasks || []).filter((t) => t.categoryId !== id),
        submissions: (prev.data.submissions || []).filter((s) => {
          const task = prev.data.tasks.find(t => t.id === s.taskId)
          return task && task.categoryId !== id
        }),
      },
    }))
  }, [])

  const deleteTask: Ctx["deleteTask"] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        tasks: (prev.data.tasks || []).filter((t) => t.id !== id),
        submissions: (prev.data.submissions || []).filter((s) => s.taskId !== id),
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
    createCampaign,
    createCategory,
    publishTask,
    editCampaign,
    editCategory,
    editTask,
    deleteCampaign,
    deleteCategory,
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
