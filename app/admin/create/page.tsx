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
import type { Campaign, Category } from "@/components/state/auth-context"

type Step = "campaign" | "category" | "task"

export default function AdminCreatePage() {
  const { currentUser, isAdmin, createCampaign, createCategory, publishTask, data } = useApp()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("campaign")
  
  // Campaign state
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  
  // Category state
  const [categoryName, setCategoryName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  
  // Task state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDetails, setTaskDetails] = useState("")
  const [taskImage, setTaskImage] = useState("")
  const [taskPoints, setTaskPoints] = useState<number>(10)

  useEffect(() => {
    if (!currentUser) router.push("/login")
    if (currentUser && !isAdmin) router.push("/tasks")
  }, [currentUser, isAdmin, router])

  if (!currentUser || !isAdmin) return null

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) return
    createCampaign({
      name: campaignName.trim(),
      description: campaignDescription.trim() || "No description provided.",
    })
    setCampaignName("")
    setCampaignDescription("")
  }

  const handleCreateCategory = () => {
    if (!categoryName.trim() || !selectedCampaignId) return
    createCategory({
      name: categoryName.trim(),
      campaignId: selectedCampaignId,
    })
    setCategoryName("")
  }

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !selectedCategoryId) return
    const campaign = data.campaigns.find(c => c.id === selectedCampaignId)
    if (!campaign) return
    
    publishTask({
      title: taskTitle.trim(),
      details: taskDetails.trim() || "No details provided.",
      image: taskImage.trim() || "/task-image.jpg",
      points: Number(taskPoints) || 0,
      categoryId: selectedCategoryId,
      campaignId: campaign.id,
    })
    setTaskTitle("")
    setTaskDetails("")
    setTaskImage("")
    setTaskPoints(10)
  }

  const resetForm = () => {
    setCampaignName("")
    setCampaignDescription("")
    setCategoryName("")
    setTaskTitle("")
    setTaskDetails("")
    setTaskImage("")
    setTaskPoints(10)
    setSelectedCampaignId("")
    setSelectedCategoryId("")
    setCurrentStep("campaign")
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Content</h1>
        <p className="text-muted-foreground">Three-step process: Campaign → Category → Task</p>
        
        {/* Step indicator */}
        <div className="flex items-center gap-4 mt-6">
          <div className={`flex items-center gap-2 ${currentStep === "campaign" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "campaign" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              1
            </div>
            <span>Campaign</span>
          </div>
          <div className="w-8 h-px bg-muted"></div>
          <div className={`flex items-center gap-2 ${currentStep === "category" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "category" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              2
            </div>
            <span>Category</span>
          </div>
          <div className="w-8 h-px bg-muted"></div>
          <div className={`flex items-center gap-2 ${currentStep === "task" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "task" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              3
            </div>
            <span>Task</span>
          </div>
        </div>
      </div>

      {/* Step 1: Campaign Creation */}
      {currentStep === "campaign" && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Step 1: Create Campaign</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input 
                id="campaign-name" 
                value={campaignName} 
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-description">Campaign Description</Label>
              <Textarea 
                id="campaign-description" 
                value={campaignDescription} 
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Enter campaign description"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateCampaign} 
                className="bg-primary text-primary-foreground"
                disabled={!campaignName.trim()}
              >
                Create Campaign
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("category")}
                disabled={data.campaigns.length === 0}
                className="border-primary/40 bg-transparent"
              >
                Next: Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Category Creation */}
      {currentStep === "category" && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Step 2: Create Category</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-select">Select Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {data.campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input 
                id="category-name" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateCategory} 
                className="bg-primary text-primary-foreground"
                disabled={!categoryName.trim() || !selectedCampaignId}
              >
                Create Category
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep("task")}
                disabled={data.categories.length === 0}
                className="border-primary/40 bg-transparent"
              >
                Next: Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Task Creation */}
      {currentStep === "task" && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Step 3: Create Task</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-select-task">Select Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {data.campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-select-task">Select Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {data.categories
                    .filter(cat => cat.campaignId === selectedCampaignId)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input 
                id="task-title" 
                value={taskTitle} 
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-details">Task Details</Label>
              <Textarea 
                id="task-details" 
                value={taskDetails} 
                onChange={(e) => setTaskDetails(e.target.value)}
                placeholder="Enter task details"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-image">Image URL</Label>
              <Input 
                id="task-image" 
                value={taskImage} 
                onChange={(e) => setTaskImage(e.target.value)}
                placeholder="/task-image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-points">Points</Label>
              <Input 
                id="task-points" 
                type="number" 
                min={0} 
                value={taskPoints} 
                onChange={(e) => setTaskPoints(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateTask} 
                className="bg-primary text-primary-foreground"
                disabled={!taskTitle.trim() || !selectedCategoryId}
              >
                Create Task
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="border-primary/40 bg-transparent"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("campaign")}
          className="border-primary/40 bg-transparent"
        >
          ← Campaign
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("category")}
          disabled={data.campaigns.length === 0}
          className="border-primary/40 bg-transparent"
        >
          Category →
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("task")}
          disabled={data.categories.length === 0}
          className="border-primary/40 bg-transparent"
        >
          Task →
        </Button>
      </div>
    </section>
  )
}
