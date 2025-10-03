"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Upload,
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
  Link,
  Image,
  Table,
  HelpCircle,
  Edit,
  ArrowLeft,
  User,
} from "lucide-react";
import { Select } from "antd";

const { Option } = Select;

const TokenManager = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  },
  clearToken: () => {
    if (typeof window !== "undefined") localStorage.removeItem("adminToken");
  },
};

export default function ProfileForm() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id ? decodeURIComponent(params.id) : null;

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileFound, setProfileFound] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [profileRaw, setProfileRaw] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    languages: [],
  });

  // TipTap editor
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: "<p>Tell us about yourself...</p>",
      editorProps: { attributes: { class: "min-h-[200px] p-4 focus:outline-none" } },
      immediatelyRender: false,
    },
    []
  );

  // map API profile -> form
  const mapProfileToForm = (u_profile) => {
    if (!u_profile) return;
    setProfileRaw(u_profile);

    const langs = (u_profile.fp_lang || "").split(",").map((s) => s.trim()).filter(Boolean);

    setFormData({
      displayName: u_profile.fp_display_name && u_profile.fp_display_name !== "0" ? u_profile.fp_display_name : "",
      languages: langs,
    });

    // Fix image URL handling - the API response shows double filename issue
    if (u_profile.fp_img && u_profile.fp_img !== "0") {
      let imageUrl = u_profile.fp_img;
      
      // Handle the double filename issue from API
      if (imageUrl.includes('--')) {
        imageUrl = imageUrl.split('--')[0];
      }
      
      // Ensure proper URL construction
      if (!imageUrl.startsWith('http')) {
        imageUrl = `https://backend.hyrelancer.in/${imageUrl.replace(/^\/+/, "")}`;
      }
      
      setImagePreviewUrl(imageUrl);
    } else {
      setImagePreviewUrl(null);
    }

    const desc = u_profile.fp_desc && u_profile.fp_desc !== "0" ? u_profile.fp_desc : "<p>Tell us about yourself...</p>";
    if (editor) editor.commands.setContent(desc);
  };

  // Fetch languages list
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch("https://backend.hyrelancer.in/api/getLanglist", {
          method: "GET",
          headers: { "Accept": "application/json" },
        });
        
        if (res.ok) {
          const data = await res.json();
          setLanguages(data.la_list || []);
        }
      } catch (err) {
        console.warn("Failed to fetch languages:", err);
        // Fallback to default languages if API fails
        setLanguages([
          { la_language: "English" },
          { la_language: "Hindi" },
          { la_language: "Bengali" },
          { la_language: "Telugu" },
          { la_language: "Tamil" }
        ]);
      }
    };

    fetchLanguages();
  }, []);

  // Fetch profile when id available
  useEffect(() => {
    if (!userIdBase64) {
      setLoading(false);
      setError("Missing id in route.");
      return;
    }

    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://backend.hyrelancer.in/api/admin/getFeUProfile/${userIdBase64}`;
        const token = TokenManager.getToken();

        const res = await fetch(url, {
          method: "GET",
          headers: { "Accept": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

        if (!res.ok) {
          console.warn("Profile fetch failed", res.status, data);
          if (res.status === 401) {
            TokenManager.clearToken();
            setError("Unauthorized. Redirecting to login...");
            router.push("/admin/login");
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        if (!cancelled) {
          if (data && data.u_profile) {
            setProfileFound(true);
            setIsEditing(false); // show display page by default when data exists
            mapProfileToForm(data.u_profile);
          } else {
            setProfileFound(false);
            setIsEditing(true); // no data -> show form
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to fetch profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [userIdBase64, router, editor]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (value) => setFormData((prev) => ({ ...prev, languages: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const content = editor ? editor.getHTML() : "";
      
      // Validation
      if (!formData.displayName.trim()) {
        throw new Error("Display name is required");
      }
      if (!content || content === "<p>Tell us about yourself...</p>" || content === "<p></p>") {
        throw new Error("About me is required");
      }
      if (formData.languages.length === 0) {
        throw new Error("At least one language is required");
      }
      // Only require image for new profiles or if no existing image
      if (!selectedFile && (!profileFound || !profileRaw?.fp_img || profileRaw.fp_img === "0")) {
        throw new Error("Profile image is required");
      }

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append("fp_u_id", userIdBase64);
      formDataToSend.append("is_status", profileFound ? "old" : "new");
      formDataToSend.append("dispalyName", formData.displayName); // Note: matches API typo
      formDataToSend.append("aboutMe", content);
      formDataToSend.append("tagLine", ""); // Empty as not used
      
      // Handle file upload
      if (selectedFile) {
        formDataToSend.append("uploadfile", selectedFile);
      } else if (imagePreviewUrl) {
        // If editing and no new file selected, send current image path
        formDataToSend.append("uploadfile", profileRaw?.fp_img || "");
      }

      // Handle languages array
      formData.languages.forEach((lang, index) => {
        formDataToSend.append(`language[${index}]`, lang);
      });

      const token = TokenManager.getToken();
      const res = await fetch("https://backend.hyrelancer.in/api/admin/storeFeUProfile", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataToSend,
      });

      const responseText = await res.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        data = responseText;
      }

      console.log("API Response Status:", res.status);
      console.log("API Response Data:", data);

      if (!res.ok) {
        if (res.status === 401) {
          TokenManager.clearToken();
          setError("Unauthorized. Redirecting to login...");
          router.push("/admin/login");
          return;
        }
        
        // Handle validation errors
        if (data && typeof data === 'object' && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(", "));
        }
        
        throw new Error(data?.message || `HTTP ${res.status}: ${responseText}`);
      }

      // Success - but check if profile was actually saved
      if (data && data.message === "Profile details saved") {
        if (!data.u_profile) {
          console.warn("Profile saved but u_profile is null - this might indicate a database issue");
          // Still show success but also log the issue
        }
        
        setSaveSuccess(true);
        setProfileFound(true);
        setIsEditing(false);
        
        // Update profile data with response if available
        if (data.u_profile) {
          mapProfileToForm(data.u_profile);
        }

        // Show success message briefly
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error("Unexpected response format");
      }

    } catch (err) {
      setError(err.message || "Failed to save profile");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button type="button" onClick={onClick} title={title} className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"}`}>
      {children}
    </button>
  );

  // Improved Display-only component for admin panel
  const DisplayProfile = ({ profile }) => {
    if (!profile) return null;

    const languages = (profile.fp_lang || "").split(",").map((s) => s.trim()).filter(Boolean);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-500">View and manage freelancer profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="mb-4">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-gray-100 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center ${imagePreviewUrl ? 'hidden' : 'flex'}`}
                  >
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile.fp_display_name && profile.fp_display_name !== "0" 
                    ? profile.fp_display_name 
                    : "No display name"
                  }
                </h2>
                
                {profile.fp_headline && profile.fp_headline !== "0" && (
                  <p className="text-sm text-gray-600 mb-4">{profile.fp_headline}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {profile.fp_available || "Not specified"}
                    </span>
                  </div>
                  {profile.fp_completing_time && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">Completing time:</span>
                      <span>{profile.fp_completing_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Languages Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {languages.length > 0 ? (
                    languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No languages specified</span>
                  )}
                </div>
              </div>

              {/* About Me Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  About Me
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: profile.fp_desc && profile.fp_desc !== "0"
                        ? profile.fp_desc
                        : "<p class='text-gray-500 italic'>No description provided</p>"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If id missing show helpful UI
  if (!userIdBase64) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Missing profile id in the URL. Make sure this page is accessed at a route like <code className="bg-yellow-100 px-1 rounded">/.../MTUz</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        </div>
      ) : (
        <div>
          {/* If profile exists and not editing -> show display page */}
          {profileFound && !isEditing ? (
            <DisplayProfile profile={profileRaw} />
          ) : (
            // Form for create/edit
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileFound ? "Edit Profile" : "Create Profile"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {profileFound ? "Update profile information" : "Set up a new profile"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Success Message */}
                {saveSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Profile saved successfully!</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Error: {error}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h2 className="text-sm font-medium text-gray-700 mb-3">Profile Pic</h2>
                    <div className="space-y-3">
                      <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                      <span className="text-sm text-gray-500 block">
                        {selectedFile ? selectedFile.name : (imagePreviewUrl ? "Current image shown below" : "No file chosen")}
                      </span>

                      {imagePreviewUrl && (
                        <div className="mt-2">
                          <img src={imagePreviewUrl} alt="Profile preview" className="w-32 h-32 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium text-gray-700 mb-3">Display Name</h2>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Display Name"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-medium text-gray-700 mb-3">Language</h2>
                    <Select
                      mode="multiple"
                      placeholder="Select languages"
                      value={formData.languages}
                      onChange={handleLanguageChange}
                      className="w-full"
                      size="large"
                      dropdownStyle={{ zIndex: 2000 }}
                    >
                      {languages.map(lang => (
                        <Option key={lang.la_language} value={lang.la_language}>
                          {lang.la_language}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-3">About Me</h2>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
                      <div className="flex items-center gap-1">
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} isActive={editor?.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarButton>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      <div className="flex items-center gap-1">
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList')} title="Bullet List"><List className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolbarButton>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      <div className="flex items-center gap-1">
                        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} isActive={editor?.isActive({textAlign:'left'})} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} isActive={editor?.isActive({textAlign:'center'})} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} isActive={editor?.isActive({textAlign:'right'})} title="Align Right"><AlignRight className="w-4 h-4" /></ToolbarButton>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      <div className="flex items-center gap-1">
                        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={editor?.isActive('blockquote')} title="Quote"><Quote className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolbarButton>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      <div className="flex items-center gap-1">
                        <ToolbarButton onClick={() => editor?.chain().focus().setLink({ href: 'https://example.com' }).run()} isActive={editor?.isActive('link')} title="Link"><Link className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton title="Image"><Image className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton title="Table"><Table className="w-4 h-4" /></ToolbarButton>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <select onChange={e => {
                          const value = e.target.value;
                          if (value === "paragraph") editor?.chain().focus().setParagraph().run();
                          else editor?.chain().focus().toggleHeading({ level: parseInt(value.replace("h", "")) }).run();
                        }} className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white">
                          <option value="paragraph">Normal</option>
                          <option value="h1">Heading 1</option>
                          <option value="h2">Heading 2</option>
                          <option value="h3">Heading 3</option>
                        </select>
                        <ToolbarButton title="Help"><HelpCircle className="w-4 h-4" /></ToolbarButton>
                      </div>
                    </div>

                    <div className="bg-white">
                      <EditorContent editor={editor} className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => profileFound ? setIsEditing(false) : router.back()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}