"use client"
import { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaSuitcase,
  FaClock,
  FaHourglassHalf,
  FaChartBar,
  FaLanguage,
  FaShareAlt,
  FaMapMarkerAlt,
  FaHeart,
  FaRegDotCircle,
  FaFilePdf,
  FaFileWord,
  FaStar,
  FaCaretUp,
  FaTimes,
  FaCaretRight,
  FaCaretLeft,
  FaSearch,
  FaDollarSign,
  FaUser,
  FaBriefcase,
  FaBuilding
} from 'react-icons/fa';
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
  InstagramFilled,
  PinterestFilled
} from '@ant-design/icons';
import { Button, Modal, message } from 'antd';
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';

const JobDetailPage = () => {
  const [isWishlist, setIsWishlist] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [bookmarkId, setBookmarkId] = useState(null);

  const params = useParams();
  const router = useRouter();
  const token = useSelector((state) => state.auth.token);
  const jobId = params.id;

  const toggleShare = () => setIsShareOpen(!isShareOpen);
  const showApplyModal = () => setIsApplyModalOpen(true);
  const handleApplyOk = () => setIsApplyModalOpen(false);
  const handleApplyCancel = () => setIsApplyModalOpen(false);

  // Format date to "X days ago"
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Check if job is bookmarked (sets bookmarkId when found)
  const checkBookmarkStatus = async () => {
    if (!token || !jobId) return;

    try {
      const response = await fetch('https://backend.hyrelancer.in/api/getBookmark', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const existingBookmark = data.data.find(
            bookmark => bookmark.customer_job?.cuj_id == jobId
          );
          if (existingBookmark) {
            setIsWishlist(true);
            setBookmarkId(existingBookmark.jb_id);
          } else {
            setIsWishlist(false);
            setBookmarkId(null);
          }
        }
      } else {
        // If unauthorized, do nothing here; higher-level fetch handles it
      }
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  // Add to bookmarks
  const addToBookmarks = async () => {
    if (!token) {
      message.error('Please login to bookmark this job');
      return;
    }

    if (!jobId) {
      message.error('Job ID not found');
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await fetch('https://backend.hyrelancer.in/api/storeBookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: parseInt(jobId)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlist(true);
        if (data.data && data.data.jb_id) {
          setBookmarkId(data.data.jb_id);
        } else {
          // If API returns no jb_id, re-check bookmarks to obtain it
          await checkBookmarkStatus();
        }
        message.success('Job added to bookmarks successfully!');
      } else {
        message.error(data.message || 'Failed to add bookmark');
      }
    } catch (err) {
      console.error('Error adding bookmark:', err);
      message.error('Error adding bookmark. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Remove from bookmarks (improved: confirm, lookup if necessary, graceful errors)
  const removeFromBookmarks = async () => {
    if (!token) {
      message.error('Please login to remove bookmark');
      return;
    }
  
    const ok = window.confirm('Are you sure you want to remove this job from bookmarks?');
    if (!ok) return;
  
    setBookmarkLoading(true);
  
    try {
      // Use the job ID from the job state
      const jobIdToDelete = job.id;
  
      if (!jobIdToDelete) {
        message.error('Job ID not found');
        return;
      }
  
      const deleteResponse = await fetch(`https://backend.hyrelancer.in/api/deleteBookmark/${jobIdToDelete}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (deleteResponse.ok) {
        setIsWishlist(false);
        setBookmarkId(null);
        message.success('Job removed from bookmarks');
      } else {
        if (deleteResponse.status === 401) {
          message.error('Unauthorized. Please log in again.');
        } else {
          let errMsg = 'Failed to remove bookmark';
          try {
            const errBody = await deleteResponse.json();
            if (errBody && errBody.message) errMsg = errBody.message;
          } catch (e) { /* ignore */ }
          message.error(errMsg);
        }
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      message.error('Error removing bookmark. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Toggle bookmark (calls add or remove)
  const toggleWishlist = async () => {
    if (isWishlist) {
      await removeFromBookmarks();
    } else {
      await addToBookmarks();
    }
  };

  // Fetch job details from API
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);

        // Check if we have a token
        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch('https://backend.hyrelancer.in/api/getAllJobs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check for unauthorized response
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.job_list && Array.isArray(data.job_list)) {
          // Find the specific job by ID
          const foundJob = data.job_list.find(j => j.cuj_id == jobId);

          if (foundJob) {
            // Format the job data
            const formattedJob = {
              id: foundJob.cuj_id,
              title: foundJob.cuj_title,
              posted: foundJob.created_at ? formatDate(foundJob.created_at) : 'Recently',
              verified: foundJob.cuj_is_active === 1,
              location: foundJob.cuj_location || 'Remote',
              salary: foundJob.cuj_salary_range_from ? `$${foundJob.cuj_salary_range_from} - $${foundJob.cuj_salary_range_to}` : 'Not specified',
              budget: foundJob.cuj_salary_range_from ? `$${foundJob.cuj_salary_range_from}` : 'Negotiable',
              rating: 4.5, // Default rating
              description: foundJob.cuj_desc || 'No description available',
              jobType: foundJob.cuj_job_type,
              workMode: foundJob.cuj_work_mode,
              experience: foundJob.cuj_u_experience,
              language: foundJob.cuj_lang,
              contact: {
                name: foundJob.cuj_contact_name,
                email: foundJob.cuj_contact_email,
                mobile: foundJob.cuj_contact_mobile
              },
              image: foundJob.cuj_img1 ? `https://backend.hyrelancer.in/${foundJob.cuj_img1}` : "/images/jd.png",
              employer: {
                id: foundJob.id,
                name: foundJob.name || 'Unknown Employer',
                email: foundJob.email,
                mobile: foundJob.mobile,
                address: foundJob.address || 'Address not specified',
                since: foundJob.created_at ? new Date(foundJob.created_at).getFullYear() : '2020'
              }
            };

            setJob(formattedJob);

            // Get related jobs (filter by same category or type)
            const related = data.job_list
              .filter(j => j.cuj_id != jobId && j.cuj_job_type === foundJob.cuj_job_type)
              .slice(0, 2)
              .map(job => ({
                id: job.cuj_id,
                title: job.cuj_title,
                posted: job.created_at ? formatDate(job.created_at) : 'Recently',
                location: job.cuj_location || 'Remote',
                budget: job.cuj_salary_range_from ? `$${job.cuj_salary_range_from}` : 'Negotiable',
                rating: 4.5,
                description: job.cuj_desc ? job.cuj_desc.substring(0, 100) + '...' : 'No description available',
                tags: [job.cuj_job_type, job.cuj_work_mode].filter(Boolean)
              }));

            setRelatedJobs(related);

            // Check bookmark status after job is loaded
            await checkBookmarkStatus();
          } else {
            setError('Job not found');
          }
        } else {
          setError('Failed to load job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId && token) {
      fetchJobDetails();
    }
  }, [jobId, token]);

  const applyForJob = async () => {
    if (!token) {
      message.error('Please login to apply for this job');
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(`https://backend.hyrelancer.in/api/sendRequestForJob/${btoa(jobId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Job application submitted successfully!');
        setIsApplyModalOpen(false);
      } else {
        message.error('Failed to apply: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error applying for job:', err);
      message.error('Error applying for job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          {error.includes('Authentication') && (
            <Link href="/login" className="block mt-2 text-blue-600 hover:underline">
              Go to Login Page
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Job not found
        </div>
      </div>
    );
  }

  return (
    <div className="lg:overflow-unset">
      <Head>
        <title>{job.title} | Hyrelancer</title>
        <meta name="description" content={job.description.substring(0, 160)} />
        <link rel="icon" href="/assets/images/fav.png" />
      </Head>

      {/* Breadcrumb Section */}
      <section
        className="bg-primary sm:pt-[35px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/breadcrumb_service.webp')",
          minHeight: "240px",
          height: "240px"
        }}
      >
        <div className="container max-w-7xl mx-auto px-4 flex max-lg:flex-col lg:items-center justify-between gap-5 gap-y-3">
          <div className="breadcrumb_info flex flex-col items-center justify-center text-center mx-auto w-full">
            <h3 className="text-2xl font-bold text-white w-full flex justify-center">{job.title}</h3>
            <ul className="list flex flex-wrap items-center justify-center gap-4 mt-3 w-full">
              <li className="time_area flex items-center gap-1 pr-4 border-r border-white justify-center">
                <FaCalendarAlt size={16} className="text-white" />
                <span className="text-base text-white">{job.posted}</span>
              </li>
              <li className="address_area flex items-center gap-1 pr-4 border-r border-white justify-center">
                <FaMapMarkerAlt size={16} className="text-white" />
                <span className="text-base text-white">{job.location}</span>
              </li>
              <li className="spent_area flex items-center gap-1 pr-4 justify-center">
                <FaDollarSign size={16} className="text-white" />
                <span className="text-base text-white">{job.budget}</span>
                <span className="text-base text-white">budget</span>
              </li>
            </ul>
          </div>
          <div className="breadcrumb_action flex flex-col max-lg:flex-col-reverse lg:items-end lg:gap-5 gap-3">
            <div className="flex gap-3">
              <button
                className="button_share flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full bg-white duration-300 hover:border-[#3d5999] relative"
                onClick={toggleShare}
              >
                <FaShareAlt size={20} />
                {isShareOpen && (
                  <ul className="social absolute right-0 top-full mt-2 bg-white p-2 rounded-lg shadow-lg z-10 flex gap-2">
                    <li className="social_item">
                      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"
                        className="social_link w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                        <FacebookFilled className="text-lg" />
                      </a>
                    </li>
                    <li className="social_item">
                      <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"
                        className="social_link w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                        <LinkedinFilled className="text-lg" />
                      </a>
                    </li>
                    <li className="social_item">
                      <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer"
                        className="social_link w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                        <TwitterSquareFilled className="text-lg" />
                      </a>
                    </li>
                  </ul>
                )}
              </button>
              <button
                className={`add_wishlist_btn w-12 h-12 flex items-center justify-center border rounded-full bg-white duration-300 ${
                  bookmarkLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#3d5999]'
                } ${
                  isWishlist ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={toggleWishlist}
                disabled={bookmarkLoading}
                title={isWishlist ? 'Remove from bookmarks' : 'Add to bookmarks'}
              >
                {bookmarkLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3d5999]"></div>
                ) : isWishlist ? (
                  <FaHeart size={20} weight="fill" className="text-red-500" />
                ) : (
                  <FaHeart size={20} className="duration-300 hover:text-[#3d5999]" />
                )}
              </button>
            </div>
            <div className="price_area whitespace-nowrap">
              <span className="text-base text-white">Budget :</span>
              <strong className="text-xl ml-0.5 text-white">{job.budget}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Project Detail Section */}
      <section className="project_detail lg:py-20 sm:py-14 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Main Content - Overview and Description */}
          <div className="flex max-lg:flex-col gap-8 lg:gap-15">
            <div className="project_info w-full lg:w-[calc(100%-400px)]">
              {/* Overview */}
              <div className="overview">
                <h6 className="text-lg font-bold mb-4">Projects Overview</h6>
                <ul className="list_overview grid sm:grid-cols-3 grid-cols-2 gap-4 w-full">
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaCalendarAlt size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Date Posted:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.posted}</strong>
                    </div>
                  </li>
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaSuitcase size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Project Type:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.jobType}</strong>
                    </div>
                  </li>
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaClock size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Work Mode:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.workMode}</strong>
                    </div>
                  </li>
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaHourglassHalf size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Experience:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.experience}</strong>
                    </div>
                  </li>
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaChartBar size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Salary Range:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.salary}</strong>
                    </div>
                  </li>
                  <li className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer">
                    <FaLanguage size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                    <div>
                      <span className="block text-gray-600 text-sm group-hover:text-white">Language:</span>
                      <strong className="text-[#3b4b82] text-sm group-hover:text-white">{job.language || 'English'}</strong>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Description */}
              <div className="description md:mt-10 mt-7 p-6 bg-white shadow-md rounded-lg">
                <h6 className="text-lg font-bold">Projects description</h6>
                <div className="flex flex-col gap-4 mt-4 text-base text-gray-600">
                  <p>{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="requirements bg-white shadow-md rounded-lg p-6 mt-7">
                <h6 className="text-lg font-bold">Requirements:</h6>
                <ul className="list_requirements flex flex-col gap-3 w-full mt-4">
                  <li className="flex text-base text-gray-600">
                    <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                    <p>Experience in {job.jobType} projects</p>
                  </li>
                  <li className="flex text-base text-gray-600">
                    <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                    <p>Ability to work {job.workMode.toLowerCase()}</p>
                  </li>
                  <li className="flex text-base text-gray-600">
                    <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                    <p>{job.experience} of relevant experience</p>
                  </li>
                  <li className="flex text-base text-gray-600">
                    <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                    <p>Proficiency in {job.language || 'English'} language</p>
                  </li>
                </ul>
              </div>

              {/* Skills */}
              <div className="skills mt-7 rounded-lg p-6 bg-white duration-300 shadow-md ">
                <h6 className="text-lg font-bold">Skills Required:</h6>
                <ul className="list_skills flex flex-wrap gap-3 gap-y-3 mt-4">
                  <li>
                    <span className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                      {job.jobType}
                    </span>
                  </li>
                  <li>
                    <span className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                      {job.workMode}
                    </span>
                  </li>
                  <li>
                    <span className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                      {job.experience}
                    </span>
                  </li>
                  <li>
                    <span className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                      {job.language || 'English'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar - About Employer */}
            <div className="project_sidebar lg:sticky lg:top-24 flex-shrink-0 lg:w-[380px] w-full h-fit">
              <div className="about overflow-hidden mt-7 rounded-xl bg-white shadow-md duration-300 hover:shadow-lg max-w-md mx-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                  <h6 className="text-lg font-bold">About the Employer</h6>
                </div>
                <div className="employer_info p-5 h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="flex items-center gap-5 w-full">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#3d5999] overflow-hidden">
                      <FaUser size={32} className="text-[#3d5999]" />
                    </div>
                    <div>
                      <div className="rate flex items-center pb-1">
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-gray-300" />
                      </div>
                      <strong className="employers_name text-lg font-bold">{job.employer.name}</strong><br/>
                      <span className="employers_establish text-gray-600 text-sm">Since {job.employer.since}</span>
                    </div>
                  </div>
                  <div className="industry flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Email:</span>
                    <strong className="text-[#3d5999] text-sm">{job.employer.email}</strong>
                  </div>
                  <div className="size flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Mobile:</span>
                    <strong className="text-[#3d5999] text-sm">{job.employer.mobile}</strong>
                  </div>
                  <div className="address flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Address:</span>
                    <strong className="text-[#3d5999] text-sm">{job.employer.address}</strong>
                  </div>
                  <div className="list_social flex flex-wrap items-center justify-between gap-4 w-full py-5">
                    <span className="text-gray-600 text-sm">Socials:</span>
                    <ul className="list flex flex-wrap items-center gap-3">
                      <li>
                        <a
                          href="https://www.facebook.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                        >
                          <FacebookFilled className="text-lg" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.linkedin.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                        >
                          <LinkedinFilled className="text-lg" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.twitter.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                        >
                          <TwitterSquareFilled className="text-lg" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-6">
                <button
                  onClick={showApplyModal}
                  className="w-full py-3 bg-[#3d5999] text-white rounded-lg font-semibold hover:bg-[#2d4373] transition-colors duration-300"
                >
                  Apply Now
                </button>
              </div>

              {/* Bookmark Status */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bookmark Status:</span>
                  <span className={`text-sm font-medium ${
                    isWishlist ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {isWishlist ? '✓ Bookmarked' : 'Not bookmarked'}
                  </span>
                </div>
                <button
                  onClick={toggleWishlist}
                  disabled={bookmarkLoading}
                  className={`w-full mt-2 py-2 rounded-lg font-medium text-sm ${
                    isWishlist 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {bookmarkLoading ? 'Processing...' : isWishlist ? 'Remove Bookmark' : 'Add to Bookmarks'}
                </button>
              </div>
            </div>
          </div>

          {/* Related Projects */}
          {relatedJobs.length > 0 && (
            <div className="related mt-8">
              <h5 className="text-xl font-bold">Related Projects</h5>
              <ul className="list_related flex flex-col md:gap-7 gap-6 w-full mt-5">
                {relatedJobs.map((relatedJob) => (
                  <li key={relatedJob.id}>
                    <div className="project_item py-5 px-6 rounded-lg bg-white duration-300 shadow-md hover:shadow-lg">
                      <div className="project_innner flex max-sm:flex-col items-center justify-between xl:gap-9 gap-6 h-full">
                        <div className="project_info">
                          <Link href={`/job-details/${relatedJob.id}`} className="project_name text-lg text-[#3d5999] font-bold duration-300 hover:text-[#000000] hover:underline">
                            {relatedJob.title}
                          </Link>
                          <div className="project_related_info flex flex-wrap items-center gap-3 mt-3">
                            <div className="project_date flex items-center gap-1">
                              <FaCalendarAlt size={14} className="text-gray-600" />
                              <span className="text-sm text-gray-600">{relatedJob.posted}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt size={14} className="text-gray-600" />
                              <span className="project_address text-sm text-gray-600">{relatedJob.location}</span>
                            </div>
                            <div className="project_rate flex items-center gap-1">
                              <span className="rate text-sm text-gray-600">4.8</span>
                              <FaStar weight="fill" size={14} className="text-yellow-400 -mt-0.5" />
                            </div>
                          </div>
                          <p className="project_desc mt-3 text-gray-600 text-sm">{relatedJob.description}</p>
                          <div className="list_tag flex items-center gap-2.5 flex-wrap mt-3">
                            {relatedJob.tags.map((tag, index) => (
                              <span key={index} className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="line flex-shrink-0 w-px h-full bg-gray-300 max-sm:hidden"></div>
                        <div className="project_more_info flex flex-shrink-0 max-sm:flex-wrap sm:flex-col sm:items-end items-start sm:gap-7 gap-4 max-sm:w-full sm:h-full">
                          <div className="max-sm:w-full max-sm:order-[-1]">
                            <div className="project_price sm:text-end mt-1">
                              <span className="price text-black font-bold">{relatedJob.budget}</span>
                              <span className="text-sm text-gray-600">/fixed-price</span>
                            </div>
                          </div>
                          <Link href={`/job-details/${relatedJob.id}`} className="button-main border bg-[#edf7f7] border-[#3d5999] text-[#3d5999] px-6 py-3 rounded-full h-fit hover:bg-[#3d5999] hover:text-white text-sm">
                            See more
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to top */}
      <button className="scroll-to-top-btn fixed bottom-8 right-8 w-12 h-12 bg-[#3d5999] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2d4373]">
        <FaCaretUp size={24} />
      </button>

      {/* Apply Modal */}
      <Modal
        title="Apply for Job"
        visible={isApplyModalOpen}
        onOk={applyForJob}
        onCancel={handleApplyCancel}
        okText={applying ? "Applying..." : "Apply Now"}
        cancelText="Cancel"
        confirmLoading={applying}
      >
        <p>Are you sure you want to apply for this job?</p>
        <p className="mt-2 font-semibold">{job.title}</p>
      </Modal>
    </div>
  );
};

export default JobDetailPage;
