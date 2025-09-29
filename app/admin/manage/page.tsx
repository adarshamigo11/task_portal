"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/state/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { Campaign, Category, Task } from "@/components/state/auth-context"

type EditMode = {
  type: "campaign" | "category" | "task" | null
  id: string | null
}

export default function AdminManagePage() {
  const { currentUser, isAdmin, data, editCampaign, editCategory, editTask, deleteCampaign, deleteCategory, deleteTask } = useApp()
  const router = useRouter()
  const [editMode, setEditMode] = useState<EditMode>({ type: null, id: null })
  
  // Campaign edit state
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  
  // Category edit state
  const [categoryName, setCategoryName] = useState("")
  const [categoryCampaignId, setCategoryCampaignId] = useState("")
  
  // Task edit state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDetails, setTaskDetails] = useState("")
  const [taskImage, setTaskImage] = useState("")
  const [taskPoints, setTaskPoints] = useState<number>(10)
  const [taskCategoryId, setTaskCategoryId] = useState("")
  const [taskCampaignId, setTaskCampaignId] = useState("")

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser && !isAdmin) router.push("/tasks")
  }, [currentUser, isAdmin, router])

  if (!currentUser || !isAdmin) return null

  const startEdit = (type: "campaign" | "category" | "task", id: string) => {
    setEditMode({ type, id })
    
    if (type === "campaign") {
      const campaign = data.campaigns.find(c => c.id === id)
      if (campaign) {
        setCampaignName(campaign.name)
        setCampaignDescription(campaign.description)
      }
    } else if (type === "category") {
      const category = data.categories.find(cat => cat.id === id)
      if (category) {
        setCategoryName(category.name)
        setCategoryCampaignId(category.campaignId)
      }
    } else if (type === "task") {
      const task = data.tasks.find(t => t.id === id)
      if (task) {
        setTaskTitle(task.title)
        setTaskDetails(task.details)
        setTaskImage(task.image)
        setTaskPoints(task.points)
        setTaskCategoryId(task.categoryId)
        setTaskCampaignId(task.campaignId)
      }
    }
  }

  const cancelEdit = () => {
    setEditMode({ type: null, id: null })
    setCampaignName("")
    setCampaignDescription("")
    setCategoryName("")
    setCategoryCampaignId("")
    setTaskTitle("")
    setTaskDetails("")
    setTaskImage("")
    setTaskPoints(10)
    setTaskCategoryId("")
    setTaskCampaignId("")
  }

  const handleEditCampaign = () => {
    if (!editMode.id || !campaignName.trim()) return
    editCampaign(editMode.id, {
      name: campaignName.trim(),
      description: campaignDescription.trim() || "No description provided.",
    })
    cancelEdit()
  }

  const handleEditCategory = () => {
    if (!editMode.id || !categoryName.trim() || !categoryCampaignId) return
    editCategory(editMode.id, {
      name: categoryName.trim(),
      campaignId: categoryCampaignId,
    })
    cancelEdit()
  }

  const handleEditTask = () => {
    if (!editMode.id || !taskTitle.trim() || !taskCategoryId) return
    editTask(editMode.id, {
      title: taskTitle.trim(),
      details: taskDetails.trim() || "No details provided.",
      image: taskImage.trim() || "/task-image.jpg",
      points: Number(taskPoints) || 0,
      categoryId: taskCategoryId,
      campaignId: taskCampaignId,
    })
    cancelEdit()
  }

  const handleDelete = (type: "campaign" | "category" | "task", id: string) => {
    if (type === "campaign") deleteCampaign(id)
    else if (type === "category") deleteCategory(id)
    else if (type === "task") deleteTask(id)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Content</h1>
        <p className="text-muted-foreground">Edit and delete campaigns, categories, and tasks</p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {(data.campaigns || []).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No campaigns created yet.</p>
            ) : (
              (data.campaigns || []).map((campaign) => (
                <Card key={campaign.id} className="border-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit("campaign", campaign.id)}
                          className="border-primary/40"
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{campaign.name}"? This will also delete all associated categories and tasks. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete("campaign", campaign.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Categories: </span>
                        <span className="font-medium">{(data.categories || []).filter(cat => cat.campaignId === campaign.id).length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tasks: </span>
                        <span className="font-medium">{(data.tasks || []).filter(task => task.campaignId === campaign.id).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {(data.categories || []).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No categories created yet.</p>
            ) : (
              (data.categories || []).map((category) => {
                const campaign = (data.campaigns || []).find(c => c.id === category.campaignId)
                return (
                  <Card key={category.id} className="border-primary/40">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{category.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Campaign: {campaign?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit("category", category.id)}
                            className="border-primary/40"
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This will also delete all associated tasks. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete("category", category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tasks: </span>
                        <span className="font-medium">{(data.tasks || []).filter(task => task.categoryId === category.id).length}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {(data.tasks || []).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks created yet.</p>
            ) : (
              (data.tasks || []).map((task) => {
                const campaign = (data.campaigns || []).find(c => c.id === task.campaignId)
                const category = (data.categories || []).find(cat => cat.id === task.categoryId)
                return (
                  <Card key={task.id} className="border-primary/40">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{task.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {campaign?.name || "Unknown"} → {category?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit("task", task.id)}
                            className="border-primary/40"
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{task.title}"? This will also delete all associated submissions. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete("task", task.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Points: </span>
                          <span className="font-medium">{task.points}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <span className="font-medium capitalize">{task.status}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Forms */}
      {editMode.type && editMode.id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-primary/40">
            <CardHeader>
              <CardTitle>Edit {editMode.type.charAt(0).toUpperCase() + editMode.type.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode.type === "campaign" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-campaign-name">Campaign Name</Label>
                    <Input
                      id="edit-campaign-name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-campaign-description">Campaign Description</Label>
                    <Textarea
                      id="edit-campaign-description"
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      placeholder="Enter campaign description"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleEditCampaign} className="bg-primary text-primary-foreground">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} className="border-primary/40">
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {editMode.type === "category" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category-campaign">Campaign</Label>
                    <Select value={categoryCampaignId} onValueChange={setCategoryCampaignId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data.campaigns || []).map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category-name">Category Name</Label>
                    <Input
                      id="edit-category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleEditCategory} 
                      className="bg-primary text-primary-foreground"
                      disabled={!categoryName.trim() || !categoryCampaignId}
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} className="border-primary/40">
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {editMode.type === "task" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-campaign">Campaign</Label>
                    <Select value={taskCampaignId} onValueChange={setTaskCampaignId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data.campaigns || []).map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-category">Category</Label>
                    <Select value={taskCategoryId} onValueChange={setTaskCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data.categories || []).filter(cat => cat.campaignId === taskCampaignId).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-title">Task Title</Label>
                    <Input
                      id="edit-task-title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-details">Task Details</Label>
                    <Textarea
                      id="edit-task-details"
                      value={taskDetails}
                      onChange={(e) => setTaskDetails(e.target.value)}
                      placeholder="Enter task details"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-image">Image URL</Label>
                    <Input
                      id="edit-task-image"
                      value={taskImage}
                      onChange={(e) => setTaskImage(e.target.value)}
                      placeholder="/task-image.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-task-points">Points</Label>
                    <Input
                      id="edit-task-points"
                      type="number"
                      min={0}
                      value={taskPoints}
                      onChange={(e) => setTaskPoints(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleEditTask} 
                      className="bg-primary text-primary-foreground"
                      disabled={!taskTitle.trim() || !taskCategoryId}
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} className="border-primary/40">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}
