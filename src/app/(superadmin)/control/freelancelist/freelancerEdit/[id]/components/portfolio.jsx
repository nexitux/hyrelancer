"use client";
import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  FileImage,
  Video,
  Edit,
  ArrowLeft,
  User,
  Briefcase,
  Settings,
} from "lucide-react";
import adminApi from "@/config/adminApi";
import { useParams } from "next/navigation";

const AdminContentForm = () => {
  const params = useParams();
  const userId = params?.id ? decodeURIComponent(params.id) : null;

  // State management
  const [userData, setUserData] = useState(null); // null = loading, false = new user, object = existing user
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentView, setCurrentView] = useState("loading"); // 'loading', 'newUser', 'dashboard', 'editSkills', 'editPortfolio'
  const [error, setError] = useState("");

  // Form state for new user / portfolio
  const [title, setTitle] = useState("");
  const [imageFields, setImageFields] = useState([
    { id: 1, file: null, preview: null },
  ]);
  const [videoFields, setVideoFields] = useState([
    { id: Date.now(), url: "", fpoi_id: null },
  ]);

  // Skills management
  const [skills, setSkills] = useState([]);
  const [skillObjects, setSkillObjects] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [editingPortfolioId, setEditingPortfolioId] = useState(null);

  // Initialize TipTap editor
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      content: "<p>Enter description here...</p>",
      editorProps: {
        attributes: {
          class:
            "min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none",
        },
      },
      immediatelyRender: false,
    },
    []
  );

  // API calls using adminApi
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get(`/getFeUPortfolio/${userId}`);

      // Normalize response data
      const { fe_skills, fe_porfolio, fe_po_img } = response.data;

      const formatImageUrl = (url) => {
        if (!url) return null;

        // Clean the URL first (remove -- suffix if present)
        const cleanUrl = url.split("--")[0];

        // Convert to absolute URL if it's a relative path
        if (!cleanUrl.startsWith('http')) {
          return `https://hyre.hyrelancer.com/${cleanUrl.replace(/^\/+/, "")}`;
        }

        return cleanUrl;
      };

      if (fe_porfolio?.length > 0 || fe_skills?.length > 0) {
        // Process portfolio data
        const processedPortfolio = fe_porfolio.map((portfolio) => {
          // Get images for this portfolio
          const portfolioImages = fe_po_img.filter(
            (img) =>
              img.fpoi_fpo_id === portfolio.fpo_id &&
              img.fpoi_type !== "Video" &&
              img.fpoi_is_active === "1"
          );

          // Get videos for this portfolio
          const portfolioVideos = fe_po_img.filter(
            (img) =>
              img.fpoi_fpo_id === portfolio.fpo_id &&
              img.fpoi_type === "Video" &&
              img.fpoi_is_active === "1"
          );

          return {
            id: portfolio.fpo_id,
            title: portfolio.fpo_title,
            description: portfolio.fpo_desc,
            mainImage: formatImageUrl(portfolio.fpo_img),
            images: portfolioImages.map((img) => ({
              id: img.fpoi_id,
              name: img.fpoi_path?.split("--")[1] || "image",
              url: formatImageUrl(img.fpoi_path),
              fpoi_id: img.fpoi_id,
            })),
            videos: portfolioVideos.map((vid) => ({
              id: vid.fpoi_id,
              url: vid.fpoi_path,
              fpoi_id: vid.fpoi_id,
            })),
            createdAt: portfolio.created_at,
          };
        });

        const processedSkillObjs = fe_skills.map((s) => ({ id: s.fs_id, skill: s.fs_skill }));
        const processedSkills = processedSkillObjs.map((s) => s.skill);

        // Save both: skillObjects holds ids, userData.skills (and skills state) keep strings
        setSkillObjects(processedSkillObjs);
        setUserData({
          portfolio: processedPortfolio,
          skills: processedSkills,
        });
        setSkills(processedSkills);
        setCurrentView("dashboard");
      } else {
        setUserData(false);
        setCurrentView("newUser");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load user data. Please try again.";
      setError(errorMessage);
      setUserData(false);
      setCurrentView("newUser");
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError("");

      // Validation
      if (!title.trim()) {
        setError("Title is required");
        return;
      }
      if (skills.length === 0) {
        setError("At least one skill is required");
        return;
      }

      // Check if main image is provided
      const mainImage = imageFields.find((field) => field.file);
      if (!mainImage || !mainImage.file) {
        setError("Please select an image file");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(mainImage.file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      const formData = new FormData();

      // Required fields
      formData.append("fp_u_id", userId);
      formData.append("title", title.trim());
      formData.append("description", editor ? editor.getHTML() : "");
      formData.append("is_status", "new");

      // Main image (required)
      formData.append("fpo_img_file", mainImage.file);

      // Additional images
      imageFields.forEach((field) => {
        if (field.file && field !== mainImage) {
          formData.append("addImageField[]", field.file);
        }
      });

      // Videos
      videoFields.forEach((field) => {
        if (field.url.trim()) {
          formData.append("video-upload[]", field.url.trim());
        }
      });

      // Skills (for new users)
      skills.forEach((skill, index) => {
        formData.append(`skillinput[${index}]`, skill);
      });

      const response = await adminApi.post("/storeFeUPortfolio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Re-fetch user data to get the latest state
      await fetchUserData();
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(". "));
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to save data. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkillsUpdate = async () => {
    try {
      setSubmitLoading(true);
      setError("");

      if (skills.length === 0) {
        setError("At least one skill is required");
        return;
      }

      // Add new skills that don't exist in original userData
      const originalSkills = userData?.skills || [];
      const newSkills = skills.filter(skill => !originalSkills.includes(skill));

      for (const skill of newSkills) {
        const formData = new FormData();
        formData.append("fp_u_id", userId);
        formData.append("skillinput", skill);
        formData.append("is_status", "update");

        await adminApi.post("/storeFeUSkill", formData);
      }

      // Update local state
      setUserData((prev) => ({ ...prev, skills }));
      setCurrentView("dashboard");
    } catch (error) {
      console.error("Error updating skills:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update skills. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePortfolioUpdate = async () => {
    try {
      setSubmitLoading(true);
      setError("");

      if (!title.trim()) {
        setError("Title is required");
        return;
      }

      const formData = new FormData();

      formData.append("fp_u_id", userId);
      formData.append("title", title.trim());
      formData.append("description", editor ? editor.getHTML() : "");
      formData.append("is_status", "update");

      if (editingPortfolioId) {
        formData.append("fpo_id", btoa(String(editingPortfolioId)));
      }

      // Handle main image - either new file or existing path
      const mainImageField = imageFields.find(
        (field) => field.file || field.existing
      );
      if (mainImageField) {
        if (mainImageField.file) {
          formData.append("fpo_img_file", mainImageField.file);
        } else if (mainImageField.existing && mainImageField.preview) {
          formData.append("fpo_img_file", mainImageField.preview);
        }
      }

      // Additional images (new files only)
      imageFields.forEach((field) => {
        if (field.file && !mainImageField.file === field.file) {
          formData.append("addImageField[]", field.file);
        }
      });

      // Videos with aligned arrays for fpoi_id[] and video-upload[]
      videoFields.forEach((field, index) => {
        const fpoiId = field.fpoi_id || "0"; // '0' for new entries
        formData.append("fpoi_id[]", fpoiId);
        formData.append("video-upload[]", field.url.trim());
      });

      let endpoint, successMessage;
      if (editingPortfolioId) {
        // Updating existing portfolio
        formData.append("fpo_id", btoa(String(editingPortfolioId)));
        endpoint = "/updateFeUPortfolio";
        successMessage = "Portfolio updated successfully";
      } else {
        // Creating new portfolio  
        formData.append("is_status", "update"); // or whatever status you need
        endpoint = "/storeFeUPortfolio";
        successMessage = "Portfolio created successfully";
      }

      const response = await adminApi.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Re-fetch data to get updated portfolio
      await fetchUserData();

      setEditingPortfolioId(null);
    } catch (error) {
      console.error("Error updating portfolio:", error);

      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(". "));
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to update portfolio. Please try again.";
        setError(errorMessage);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const startNewPortfolioItem = () => {
    setEditingPortfolioId(null);
    setTitle("");
    setImageFields([{ id: Date.now(), file: null, preview: null }]);
    setVideoFields([{ id: Date.now(), url: "", fpoi_id: null }]);
    if (editor)
      editor.commands.setContent("<p>Enter description here...</p>");
    setError("");
    setCurrentView("editPortfolio");
  };

  const startEditPortfolioItem = (idOrIndex) => {
    const portfolio = Array.isArray(userData?.portfolio)
      ? userData.portfolio.find((p) => p.id === idOrIndex) ||
      userData.portfolio[idOrIndex]
      : null;

    setEditingPortfolioId(portfolio?.id ?? null);
    setTitle(portfolio?.title || "");
    if (editor)
      editor.commands.setContent(
        portfolio?.description || "<p>Enter description here...</p>"
      );

    // Setup image fields with existing data
    const newImageFields = [];

    // Add main image if exists
    if (portfolio?.mainImage) {
      newImageFields.push({
        id: "main-" + Date.now(),
        file: null,
        preview: portfolio.mainImage.split("--")[0],
        existing: true,
      });
    }

    // Add additional images
    if (portfolio?.images) {
      portfolio.images.forEach((img) => {
        newImageFields.push({
          id: img.id || Date.now(),
          file: null,
          preview: img.url,
          existing: true,
          fpoi_id: img.fpoi_id,
        });
      });
    }

    if (newImageFields.length === 0) {
      newImageFields.push({ id: Date.now(), file: null, preview: null });
    }
    setImageFields(newImageFields);

    // Setup video fields with existing data and fpoi_id
    const newVideoFields = (portfolio?.videos || []).map((vid) => ({
      id: vid.id || Date.now(),
      url: vid.url,
      fpoi_id: vid.fpoi_id,
    }));

    if (newVideoFields.length === 0) {
      newVideoFields.push({ id: Date.now(), url: "", fpoi_id: null });
    }
    setVideoFields(newVideoFields);

    setError("");
    setCurrentView("editPortfolio");
  };

  // Initialize data fetch
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Utility functions
  const resetForm = () => {
    setTitle("");
    setImageFields([{ id: Date.now(), file: null, preview: null }]);
    setVideoFields([{ id: Date.now(), url: "", fpoi_id: null }]);
    if (editor) {
      editor.commands.setContent("<p>Enter description here...</p>");
    }
    setError("");
  };

  const resetSkillsForm = () => {
    setSkills(userData?.skills || []);
    setSkillInput("");
    setError("");
  };

  // Handle image file change
  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    const updatedFields = imageFields.map((field) => {
      if (field.id === id) {
        let preview = null;
        if (file) {
          preview = URL.createObjectURL(file);
        }
        return { ...field, file, preview };
      }
      return field;
    });
    setImageFields(updatedFields);
  };

  // Handle video URL change
  const handleVideoUrlChange = (id, e) => {
    const updatedFields = videoFields.map((field) =>
      field.id === id ? { ...field, url: e.target.value } : field
    );
    setVideoFields(updatedFields);
  };

  // Skills management
  const addSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (skills.includes(val)) {
      setSkillInput("");
      return;
    }

    // Add to plain string array (used by update logic/UI)
    setSkills((prev) => [...prev, val]);

    // Also add a placeholder in skillObjects so indices align with `skills`.
    // New items have no server id yet (id: null).
    setSkillObjects((prev) => [...prev, { id: null, skill: val }]);

    setSkillInput("");
  };

  // Add/Remove fields
  const addImageField = () => {
    setImageFields([
      ...imageFields,
      { id: Date.now(), file: null, preview: null },
    ]);
  };

  const removeImageField = (id) => {
    if (imageFields.length > 1) {
      const field = imageFields.find((f) => f.id === id);
      if (field?.preview && field.file) {
        URL.revokeObjectURL(field.preview);
      }
      setImageFields(imageFields.filter((field) => field.id !== id));
    }
  };

  const addVideoField = () => {
    setVideoFields([
      ...videoFields,
      { id: Date.now(), url: "", fpoi_id: null },
    ]);
  };

  const removeVideoField = (id) => {
    if (videoFields.length > 1) {
      setVideoFields(videoFields.filter((field) => field.id !== id));
    }
  };

  // Navigation handlers
  const handleEditSkills = () => {
    setSkills([...userData.skills]);
    setCurrentView("editSkills");
  };

  const handleDeleteSkill = async (skillIndex, skillNameParam) => {
    try {
      setSubmitLoading(true);
      setError("");

      // Determine skill name (UI text) and skill id (from skillObjects)
      const skillName = skillNameParam ?? skills[skillIndex];
      const skillObj = skillObjects[skillIndex];
      const skillId = skillObj?.id ?? null;

      // Prevent removing last skill
      const projectedSkills = skills.filter((_, idx) => idx !== skillIndex);
      if (projectedSkills.length === 0) {
        setError("You must have at least one skill");
        return;
      }

      // If we have an ID for the skill, call backend to delete
      if (skillId) {
        try {
          // Try DELETE endpoint first (replace if your API differs)
          await adminApi.get(`/deleteFeUData/1/${btoa(String(skillId))}`);
        } catch (deleteErr) {
          // Fallback: call skill store endpoint with is_status=delete (if backend expects that)
          try {
            const formData = new FormData();
            formData.append("fp_u_id", userId);
            formData.append("fs_id", skillId);
            formData.append("is_status", "delete");
            await adminApi.post("/storeFeUSkill", formData);
          } catch (postErr) {
            console.error("Backend delete fallback failed:", postErr);
            setError("Failed to delete skill on server. Try again.");
            return;
          }
        }
      } else {
        // No skillId (newly added unsaved skill) — nothing to delete on server
        // Proceed to update local state only.
      }

      // Update local UI state after successful server deletion (or local-only deletion)
      const updatedSkillObjs = skillObjects.filter((_, idx) => idx !== skillIndex);
      setSkillObjects(updatedSkillObjs);

      setSkills(projectedSkills);
      setUserData((prev) => ({ ...prev, skills: projectedSkills }));
    } catch (error) {
      console.error("Error deleting skill:", error);
      setError("Failed to delete skill. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };


  const goBack = () => {
    if (currentView === "editSkills") {
      resetSkillsForm();
    } else if (currentView === "editPortfolio") {
      resetForm();
    }
    setCurrentView("dashboard");
  };

  // Toolbar button component
  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"
        }`}
    >
      {children}
    </button>
  );

  // Loading state
  if (currentView === "loading") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New User Form
  if (currentView === "newUser") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Portfolio Setup
                </h1>
                <p className="text-sm text-gray-500">
                  Create user's portfolio and skills
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills *
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No skills added yet. Please add at least one skill.
                    </div>
                  ) : (
                    skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm text-gray-800">{skill}</span>
                        {skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(idx, skill)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            title="Remove skill"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter portfolio title"
                  required
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images *
                </label>
                {imageFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <FileImage className="w-4 h-4 mr-2" />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageChange(field.id, e)}
                            accept="image/*"
                          />
                        </label>
                        <span className="text-sm text-gray-500 flex-1">
                          {field.file ? field.file.name : "No file chosen"}
                        </span>
                        {field.preview && (
                          <img
                            src={field.preview}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    {imageFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URLs
                </label>
                {videoFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-2 text-gray-500" />
                        <input
                          type="url"
                          value={field.url}
                          onChange={(e) => handleVideoUrlChange(field.id, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter video URL"
                        />
                      </div>
                    </div>
                    {videoFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Video URL
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
                    <ToolbarButton
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      isActive={editor?.isActive("bold")}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      isActive={editor?.isActive("italic")}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                      isActive={editor?.isActive("strike")}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      isActive={editor?.isActive("bulletList")}
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      isActive={editor?.isActive("orderedList")}
                      title="Ordered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("left").run()
                      }
                      isActive={editor?.isActive({ textAlign: "left" })}
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("center").run()
                      }
                      isActive={editor?.isActive({ textAlign: "center" })}
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("right").run()
                      }
                      isActive={editor?.isActive({ textAlign: "right" })}
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                      }
                      isActive={editor?.isActive("blockquote")}
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() => editor?.chain().focus().undo().run()}
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() => editor?.chain().focus().redo().run()}
                      title="Redo"
                    >
                      <Redo className="w-4 h-4" />
                    </ToolbarButton>
                  </div>

                  {/* Editor Content */}
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleNewUserSubmit}
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Create Portfolio
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === "dashboard") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Portfolio Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage portfolio and skills
                  </p>
                </div>
              </div>
              <button
                onClick={startNewPortfolioItem}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Portfolio Item
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Skills Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <button
                  onClick={handleEditSkills}
                  className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Skills
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userData?.skills?.length > 0 ? (
                  userData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Portfolio Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Portfolio Items
              </h2>
              {userData?.portfolio?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userData.portfolio.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      {item.mainImage && (
                        <img
                          src={item.mainImage} // Now it's already properly formatted
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-medium text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <div
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => startEditPortfolioItem(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No portfolio items yet</p>
                  <button
                    onClick={startNewPortfolioItem}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Portfolio Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Skills View
  if (currentView === "editSkills") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Edit Skills
                  </h1>
                  <p className="text-sm text-gray-500">
                    Update skills and expertise
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Add Skill Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Skill
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a skill and press Enter or click Add"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Current Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Skills
                </label>
                <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {skills.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No skills added yet. Add at least one skill.
                    </div>
                  ) : (
                    skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{skill}</span>
                        {skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(idx)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            title="Remove skill"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {skills.length === 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Note: You must have at least one skill
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSkillsUpdate}
                  disabled={submitLoading || skills.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Update Skills
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Portfolio View
  if (currentView === "editPortfolio") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {editingPortfolioId
                      ? "Edit Portfolio Item"
                      : "Add New Portfolio Item"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {editingPortfolioId
                      ? "Update portfolio item"
                      : "Create a new portfolio item"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter portfolio title"
                  required
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                {imageFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <FileImage className="w-4 h-4 mr-2" />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageChange(field.id, e)}
                            accept="image/*"
                          />
                        </label>
                        <span className="text-sm text-gray-500 flex-1">
                          {field.file
                            ? field.file.name
                            : field.existing
                              ? "Current image"
                              : "No file chosen"}
                        </span>
                        {field.preview && (
                          <img
                            src={field.preview}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    {imageFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URLs
                </label>
                {videoFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-2 text-gray-500" />
                        <input
                          type="url"
                          value={field.url}
                          onChange={(e) => handleVideoUrlChange(field.id, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter video URL"
                        />
                      </div>
                    </div>
                    {videoFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Video URL
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
                    <ToolbarButton
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      isActive={editor?.isActive("bold")}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      isActive={editor?.isActive("italic")}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                      isActive={editor?.isActive("strike")}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      isActive={editor?.isActive("bulletList")}
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      isActive={editor?.isActive("orderedList")}
                      title="Ordered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("left").run()
                      }
                      isActive={editor?.isActive({ textAlign: "left" })}
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("center").run()
                      }
                      isActive={editor?.isActive({ textAlign: "center" })}
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().setTextAlign("right").run()
                      }
                      isActive={editor?.isActive({ textAlign: "right" })}
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <ToolbarButton
                      onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                      }
                      isActive={editor?.isActive("blockquote")}
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() => editor?.chain().focus().undo().run()}
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                      onClick={() => editor?.chain().focus().redo().run()}
                      title="Redo"
                    >
                      <Redo className="w-4 h-4" />
                    </ToolbarButton>
                  </div>

                  {/* Editor Content */}
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePortfolioUpdate}
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingPortfolioId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingPortfolioId ? (
                        <Edit className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {editingPortfolioId
                        ? "Update Portfolio"
                        : "Create Portfolio"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminContentForm;
