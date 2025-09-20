"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Palette,
  Briefcase,
  Trophy,
  Heart,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import api from "../../../../config/api";

const CategorySelector = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic categories and subcategories from API
  const [categories, setCategories] = useState([]);
  const [subcategoryMap, setSubcategoryMap] = useState({});

  // Build categories/subcategories from API
  useEffect(() => {
    let isMounted = true;
    const fetchSiteData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/getSiteData');
        const data = res?.data || {};
        const scList = Array.isArray(data.sc_list) ? data.sc_list : [];
        const seList = Array.isArray(data.se_list) ? data.se_list : [];

        // Assign default icon/visuals cyclically
        const iconCycle = [Monitor, Palette, Briefcase, Trophy, Heart, GraduationCap];
        const colorCycle = [
          { gradient: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
          { gradient: 'from-pink-500 to-rose-400', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700' },
          { gradient: 'from-amber-500 to-orange-400', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700' },
          { gradient: 'from-emerald-500 to-teal-400', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700' },
          { gradient: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-700' },
          { gradient: 'from-sky-500 to-blue-500', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', textColor: 'text-sky-700' },
        ];

        const builtCategories = scList.filter(sc => sc.sc_id !== 1).map((sc, idx) => {
          const color = colorCycle[idx % colorCycle.length];
          const IconComp = iconCycle[idx % iconCycle.length];
          return {
            key: String(sc.sc_id),
            scId: sc.sc_id,
            name: sc.sc_name,
            icon: IconComp,
            gradient: color.gradient,
            bgColor: color.bgColor,
            borderColor: color.borderColor,
            textColor: color.textColor,
          };
        });

        const builtSubMap = {};
        scList.filter(sc => sc.sc_id !== 1).forEach((sc) => {
          const scId = sc.sc_id;
          builtSubMap[scId] = seList
            .filter((se) => se.se_sc_id === scId)
            .map((se) => ({ id: se.se_id, name: se.se_name }));
        });

        if (isMounted) {
          setCategories(builtCategories);
          setSubcategoryMap(builtSubMap);
        }
      } catch (e) {
        if (isMounted) setError('Failed to load categories');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSiteData();
    return () => { isMounted = false; };
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (service) => {
    const serviceId = service?.id || service;
    setSelectedSubcategory(serviceId);
    if (selectedCategory?.scId && serviceId) {
      router.push(`/customer-dashboard/job-post/form?category=${selectedCategory.scId}&service=${serviceId}`);
    } else {
    router.push("/customer-dashboard/job-post/form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
            <Sparkles size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              Professional Job Posting
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent pb-4">
            Select Category
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Choose the perfect category for your opportunity
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Category
              </span>
            </div>
            <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-gray-300" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedCategory
                    ? "bg-gradient-to-r from-purple-500 to-purple-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    selectedCategory ? "text-white" : "text-gray-500"
                  }`}
                >
                  2
                </span>
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  selectedCategory ? "text-gray-700" : "text-gray-400"
                }`}
              >
                Subcategory
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl shadow-black/5 border border-white/30 overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-5">
            {/* Categories Panel */}
            <div className="xl:col-span-2 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Categories
                </h2>
                <p className="text-gray-600 text-sm">
                  Select your industry focus
                </p>
              </div>

              {loading && (
                <div className="text-gray-500 text-sm">Loading categories...</div>
              )}
              {error && !loading && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {!loading && !error && (
              <div className="space-y-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory?.key === category.key;
                  const isHovered = hoveredCategory === category.key;

                  return (
                    <div
                      key={category.key}
                      onClick={() => handleCategorySelect(category)}
                      onMouseEnter={() => setHoveredCategory(category.key)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? `${category.bgColor} ${category.borderColor} border-2 shadow-lg`
                          : "border-2 border-transparent hover:bg-white/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative p-3 rounded-xl transition-all duration-300 ${
                            isSelected || isHovered
                              ? `bg-gradient-to-r ${category.gradient}`
                              : "bg-gray-100 group-hover:bg-gray-200"
                          }`}
                        >
                          <IconComponent
                            size={24}
                            className={`transition-colors duration-300 ${
                              isSelected || isHovered
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold transition-colors duration-300 ${
                              isSelected
                                ? category.textColor
                                : "text-gray-900 group-hover:text-gray-700"
                            }`}
                          >
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {(subcategoryMap[category.scId]?.length || 0)} specializations
                          </p>
                        </div>
                        <ArrowRight
                          size={18}
                          className={`transition-all duration-300 ${
                            isSelected
                              ? `${category.textColor} translate-x-1`
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {/* Subcategories Panel */}
            <div className="xl:col-span-3 p-8 xl:border-l border-white/30">
              {selectedCategory ? (
                <div className="h-full">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${selectedCategory.gradient}`}
                      >
                        <selectedCategory.icon
                          size={20}
                          className="text-white"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCategory.name}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Choose your specific area of expertise
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(subcategoryMap[selectedCategory.scId] || []).map(
                      (service, index) => (
                        <div
                          key={index}
                          onClick={() => handleSubcategorySelect(service)}
                          className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedSubcategory === (service?.id || service)
                              ? "border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 hover:bg-white/70 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium transition-colors duration-300 ${
                                selectedSubcategory === (service?.id || service)
                                  ? "text-purple-700"
                                  : "text-gray-900 group-hover:text-gray-700"
                              }`}
                            >
                              {service?.name || service}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                selectedSubcategory === (service?.id || service)
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 scale-110"
                                  : "bg-gray-200 group-hover:bg-gray-300"
                              }`}
                            >
                              <ArrowRight
                                size={12}
                                className={
                                  selectedSubcategory === (service?.id || service)
                                    ? "text-white"
                                    : "text-gray-600"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <Monitor size={32} className="text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to Begin?
                  </h3>
                  <p className="text-gray-600 max-w-md leading-relaxed">
                    Select a category from the left to explore specialized
                    subcategories. Each option is carefully curated to help you
                    find the perfect match for your project.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
