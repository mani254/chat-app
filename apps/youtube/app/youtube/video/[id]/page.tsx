"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import EnhancedPlayer from "../../components/EnhancedPlayer";
import { Heart, Share2, MessageCircle, Eye, Calendar, User } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import api from "@/lib/api";

interface Video {
  _id: string;
  title: string;
  description: string;
  playbackId: string;
  uploadedBy: string;
  category?: string;
  visibility: string;
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  duration?: number;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.id as string;
  
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]); // Comment functionality not yet implemented

  const loadVideo = useCallback(async () => {
    try {
      const response = await api.get(`/api/videos/${videoId}`);
      setVideo(response.data.video);
    } catch (error) {
      console.error("Failed to load video:", error);
      toast.error("Failed to load video");
      router.push("/youtube");
    } finally {
      setLoading(false);
    }
  }, [videoId, router]);

  const trackView = useCallback(async () => {
    try {
      await api.post(`/api/videos/${videoId}/view`);
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      loadVideo();
      trackView();
    }
  }, [videoId, loadVideo, trackView]);

  const handleLike = async () => {
    try {
      const newLikedState = !hasLiked;
      setHasLiked(newLikedState);
      
      await api.post(`/api/videos/${videoId}/like`, { liked: newLikedState });
      
      // Update local count
      if (video) {
        setVideo({
          ...video,
          likes: video.likes + (newLikedState ? 1 : -1)
        });
      }
    } catch (error) {
      console.error("Failed to like video:", error);
      setHasLiked(!hasLiked); // Revert on error
      toast.error("Failed to like video");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/mux/video/${videoId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast("Video link copied to clipboard");
      } catch {
        toast("Failed to copy link");
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      // TODO: Implement comment submission
      toast("Comments feature coming soon!");
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Video not found</h2>
          <Button onClick={() => router.push("/mux/youtube")}>
            Back to YouTube
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Video Player */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="aspect-video bg-black">
            <EnhancedPlayer
              playbackId={video.playbackId}
              title={video.title}
              videoId={video._id}
              className="w-full h-full"
              onTimeUpdate={(time) => {
                // Could implement watch progress tracking here
                console.log("Current time:", time);
              }}
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{video.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
              {video.category && (
                <div className="flex items-center space-x-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {video.category}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center space-x-1"
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{video.likes.toLocaleString()}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
          
          {video.description && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({video.comments})
          </h3>
          
          <div className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-red-500 hover:bg-red-600"
              >
                Post Comment
              </Button>
            </div>
          </div>
          
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{comment.author}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-10">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}