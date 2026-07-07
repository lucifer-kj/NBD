"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import StarRating from "./star-rating"
import { useToast } from "@/components/ui/toast"

interface ReviewFormProps {
  onSubmit: (review: { name: string; email: string; rating: number; title: string; comment: string }) => void
  isSubmitting?: boolean
}

export default function ReviewForm({ onSubmit, isSubmitting = false }: ReviewFormProps) {
  const { showToast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      showToast("Please select a rating", "error")
      return
    }
    if (!title.trim()) {
      showToast("Please enter a review title", "error")
      return
    }
    if (!comment.trim()) {
      showToast("Please enter a review comment", "error")
      return
    }
    
    if (!name.trim()) {
      showToast("Please enter your name", "error")
      return
    }
    if (!email.trim() || !email.includes('@')) {
      showToast("Please enter a valid email", "error")
      return
    }
    
    onSubmit({ 
      name: name.trim(), 
      email: email.trim(), 
      rating, 
      title: title.trim(), 
      comment: comment.trim() 
    })
    
    // Reset form
    setRating(0)
    setTitle("")
    setComment("")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <CardTitle className="mb-4">Write a Review</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reviewer_name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input
                id="reviewer_name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="reviewer_email" className="block text-sm font-medium mb-2">
                Your Email
              </label>
              <Input
                id="reviewer_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <StarRating
              rating={rating}
              size="lg"
              interactive={true}
              onRatingChange={setRating}
              showValue={true}
            />
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Review Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              required
            />
          </div>

          {/* Review Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Review Comment
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed thoughts about this product..."
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !title.trim() || !comment.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 