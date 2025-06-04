"use client";

import React, { useEffect, useState } from "react";
import authService, { User } from "../../src/services/auth/authService";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, Calendar, Mail, Edit2 } from "lucide-react";
import defaultAvatar from "../../assets/avatar.webp";
import Sidebar from "../../components/layout/Sidebar";
import { EditProfileModal } from "../../components/profile/EditProfileModal";

const ProfilePage = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await authService.getProfile();
      if (res.data) {
        setProfile(res.data);
        setError(null);
      } else {
        setError(res.error?.message || "Failed to load profile");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: User) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto mt-10 px-4">
        <Card className="overflow-hidden bg-background border shadow-lg rounded-xl">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-orange-500 to-pink-500" />
          
          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
              <div className="relative">
                <img
                  src={profile.avatarUrl || (typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src)}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-background bg-white object-cover shadow-lg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-background"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {profile.username}
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">ID: {profile.id.slice(0, 6)}...</span>
                </h2>
                <div className="flex flex-col md:flex-row gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{profile.reputationScore}</div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{profile.postScore}</div>
                <div className="text-sm text-muted-foreground">Post Score</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{profile.commentScore}</div>
                <div className="text-sm text-muted-foreground">Comment Score</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-500">{profile.communityScore}</div>
                <div className="text-sm text-muted-foreground">Community Score</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        currentProfile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfilePage; 