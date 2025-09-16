"use client"
import { useState } from 'react';
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
  FaDollarSign
} from 'react-icons/fa';
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
  InstagramFilled,
  PinterestFilled
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import Image from "next/image";

const ProjectDetail = () => {
  const [isWishlist, setIsWishlist] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const toggleWishlist = () => setIsWishlist(!isWishlist);
  const toggleShare = () => setIsShareOpen(!isShareOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const showApplyModal = () => setIsApplyModalOpen(true);
  const handleApplyOk = () => setIsApplyModalOpen(false);
  const handleApplyCancel = () => setIsApplyModalOpen(false);

  return (
    <div className="lg:overflow-unset">
      {/* Breadcrumb Section */}
      <section
        className="bg-primary sm:pt-[35px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/breadcrumb_service.webp')",
          minHeight: "240px", // Increased image height
          height: "240px"     // You can adjust this value as needed
        }}
      >
        <div className="container max-w-7xl mx-auto px-4 flex max-lg:flex-col lg:items-center justify-between gap-5 gap-y-3">
          <div className="breadcrumb_info flex flex-col items-center justify-center text-center mx-auto w-full">
            <h3 className="text-2xl font-bold text-white w-full flex justify-center">Need a UX designer to design a website on figma</h3>
            <ul className="list flex flex-wrap items-center justify-center gap-4 mt-3 w-full">
              <li className="time_area flex items-center gap-1 pr-4 border-r border-white justify-center">
                <FaCalendarAlt size={16} className="text-white" />
                <span className="text-base text-white">2 days ago</span>
              </li>
              <li className="address_area flex items-center gap-1 pr-4 border-r border-white justify-center">
                <FaMapMarkerAlt size={16} className="text-white" />
                <span className="text-base text-white">Las Vegas, USA</span>
              </li>
              <li className="spent_area flex items-center gap-1 pr-4 justify-center">
                <FaDollarSign size={16} className="text-white" />
                <span className="text-base text-white">2.8K</span>
                <span className="text-base text-white">spent</span>
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
                className="add_wishlist_btn w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full bg-white duration-300 hover:border-[#3d5999]"
                onClick={toggleWishlist}
              >
                {isWishlist ? (
                  <FaHeart size={20} weight="fill" className="text-red-500" />
                ) : (
                  <FaHeart size={20} className="duration-300 hover:text-[#3d5999]" />
                )}
              </button>
            </div>
            <div className="price_area whitespace-nowrap">
              <span className="text-base text-white">Budget :</span>
              <strong className="text-xl ml-0.5 text-white">$900</strong>
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
                  {[
                    { icon: FaCalendarAlt, label: "Date Posted:", value: "April 30, 2024" },
                    { icon: FaSuitcase, label: "Project Type:", value: "Fixed" },
                    { icon: FaClock, label: "Project Duration:", value: "100 hours" },
                    { icon: FaHourglassHalf, label: "Hours:", value: "35h /week" },
                    { icon: FaChartBar, label: "Experience:", value: "4 Year" },
                    { icon: FaLanguage, label: "English Level:", value: "Fluent" },
                  ].map(({ icon: Icon, label, value }, idx) => (
                    <li
                      key={idx}
                      className="group flex items-center gap-3 rounded-full bg-white p-3 shadow-md hover:bg-[#3b4b82] transition-colors duration-300 cursor-pointer"
                    >
                      <Icon size={26} className="flex-shrink-0 text-[#3b4b82] group-hover:text-white" />
                      <div>
                        <span className="block text-gray-600 text-sm group-hover:text-white">{label}</span>
                        <strong className="text-[#3b4b82] text-sm group-hover:text-white">{value}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div className="description md:mt-10 mt-7 p-6 bg-white shadow-md rounded-lg">
                <h6 className="text-lg font-bold">Projects description</h6>
                <div className="flex flex-col gap-4 mt-4 text-base text-gray-600">
                  <p>Actively Looking For A Freelance/Open Format UI/UX Fullstack Developer Versatile In MERN For
                    Rectifying UI & Make UI responsive to Devices on Recently Launched Website</p>
                  <p>As a Lead User Experience Designer, you will collaborate closely with our Creative Directors
                    and Associate Creative Directors to conceptualize and execute innovative campaigns and
                    digital experiences. You'll play a key role in making strategic UX decisions and creating
                    wireframes that guide the user journey.</p>
                </div>
              </div>
            </div>

            {/* Sidebar - About Employer */}
            <div className="project_sidebar lg:sticky lg:top-24 flex-shrink-0 lg:w-[380px] w-full h-fit">
              <div className="about overflow-hidden mt-7 rounded-xl bg-white shadow-md duration-300 hover:shadow-lg max-w-md mx-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                  <h6 className="text-lg font-bold">About the Employer</h6>
                </div>
                <div
                  className="employer_info p-5 h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  <a href="#" className="flex items-center gap-5 w-full">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#3d5999] overflow-hidden">
                      <Image
                        src="/images/jd.png"
                        alt="PrimeEdge Solutions Logo"
                        width={80}
                        height={80}
                        className="object-cover w-20 h-20 rounded-full"
                        priority
                      />
                    </div>
                    <div>
                      <div className="rate flex items-center pb-1">
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-yellow-400" />
                        <FaStar weight="fill" size={16} className="text-gray-300" />
                      </div>
                      <strong className="employers_name text-lg font-bold">PrimeEdge Solutions</strong><br/>
                      <span className="employers_establish text-gray-600 text-sm">Since December 11, 2020</span>
                    </div>
                  </a>
                  <div className="industry flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Industry:</span>
                    <strong className="text-[#3d5999] text-sm">Internet Publishing</strong>
                  </div>
                  <div className="size flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Company size:</span>
                    <strong className="text-[#3d5999] text-sm">150 Employees</strong>
                  </div>
                  <div className="address flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600 text-sm">Address:</span>
                    <strong className="text-[#3d5999] text-sm">3 SValley, Las Vegas, USA</strong>
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
                      <li>
                        <a
                          href="https://www.instagram.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                        >
                          <InstagramFilled className="text-lg" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.pinterest.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                        >
                          <PinterestFilled className="text-lg" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Sections */}
          <div className="w-full mt-8">
            {/* Requirements */}
            <div className="requirements bg-white shadow-md rounded-lg p-6">
              <h6 className="text-lg font-bold">Requirements:</h6>
              <ul className="list_requirements flex flex-col gap-3 w-full mt-4">
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>10-12 Pages : 6 Similar Pages</p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Dual Environment : Logged-In & Logged Out/Universal</p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Micro Tasks On Each Page & Code Alterations : Header Alignment, Footer Alignment, Card
                    Alignments, Overlap Rectification, Square Movement, Back Ground Video Alteration etc.
                  </p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Pre-Defined Content Cards</p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Pre-Defined Design Format</p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Source Codes Available</p>
                </li>
                <li className="flex text-base text-gray-600">
                  <FaRegDotCircle className="mt-1 mr-2 text-[#3d5999]" />
                  <p>Server Deplorable</p>
                </li>
              </ul>
            </div>

            {/* Attachments */}
            <div className="attachments mt-7 bg-white shadow-md rounded-lg p-6">
              <h6 className="text-lg font-bold">Attachments:</h6>
              <ul className="list_attachments flex flex-wrap gap-4 gap-y-5 mt-4">
                <li>
                  <a href="#!"
                    className="flex items-center justify-between gap-3 w-full sm:w-[240px] h-[76px] p-3 rounded-lg bg-gray-100 duration-300 hover:bg-gray-200">
                    <div>
                      <span className="text-sm font-bold text-gray-600 uppercase">file_name_pdf</span>
                      <strong className="block mt-1 text-black cursor-pointer">PDF</strong>
                    </div>
                    <FaFilePdf size={32} className="flex-shrink-0 text-[#3d5999]" />
                  </a>
                </li>
                <li>
                  <a href="#!"
                    className="flex items-center justify-between gap-3 w-full sm:w-[240px] h-[76px] p-3 rounded-lg bg-gray-100 duration-300 hover:bg-gray-200">
                    <div>
                      <span className="text-sm font-bold text-gray-600 uppercase">file_name_doc</span>
                      <strong className="block mt-1 text-black cursor-pointer">DOC</strong>
                    </div>
                    <FaFileWord size={32} className="flex-shrink-0 text-[#3d5999]" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Skills */}
            <div className="skills mt-7 rounded-lg p-6 bg-white duration-300 shadow-md ">
              <h6 className="text-lg font-bold">Skills Required:</h6>
              <ul className="list_skills flex flex-wrap gap-3 gap-y-3 mt-4">
                <li>
                  <a href="#"
                    className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                    Website Design </a>
                </li>
                <li>
                  <a href="#"
                    className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                    Mobile App </a>
                </li>
                <li>
                  <a href="#"
                    className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                    Animation </a>
                </li>
                <li>
                  <a href="#"
                    className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                    Adobe Photoshop </a>
                </li>
                <li>
                  <a href="#"
                    className="tag px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-[#3d5999] hover:text-white rounded-full">
                    Figma </a>
                </li>
              </ul>
            </div>

            {/* Related Projects */}
            <div className="related mt-8">
              <h5 className="text-xl font-bold">Related Projects</h5>
              <ul className="list_related flex flex-col md:gap-7 gap-6 w-full mt-5">
                <li>
                  <div className="project_item py-5 px-6 rounded-lg bg-white duration-300 shadow-md hover:shadow-lg">
                    <div className="project_innner flex max-sm:flex-col items-center justify-between xl:gap-9 gap-6 h-full">
                      <div className="project_info">
                        <a href="#"
                          className="project_name text-lg text-[#3d5999] font-bold duration-300 hover:text-[#000000] hover:underline">Figma mockup
                          needed for a new website for Electrical contractor business website</a>
                        <div className="project_related_info flex flex-wrap items-center gap-3 mt-3">
                          <div className="project_date flex items-center gap-1">
                            <FaCalendarAlt size={14} className="text-gray-600" />
                            <span className="text-sm text-gray-600">2 days ago</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt size={14} className="text-gray-600" />
                            <span className="project_address text-sm text-gray-600">Las Vegas, USA</span>
                          </div>
                          <div className="project_spent flex items-center gap-1">
                            <FaDollarSign size={14} className="text-gray-600" />
                            <span className="text-sm text-gray-600">2.8K</span>
                            <span className="text-sm text-gray-600">spent</span>
                          </div>
                          <div className="project_rate flex items-center gap-1">
                            <span className="rate text-sm text-gray-600">4.8</span>
                            <FaStar weight="fill" size={14} className="text-yellow-400 -mt-0.5" />
                          </div>
                        </div>
                        <p className="project_desc mt-3 text-gray-600 text-sm">I am looking for a talented UX/UI
                          Designer to create screens for my basic product idea. The project involves
                          designing a web application, you may be missing out...</p>
                        <div className="list_tag flex items-center gap-2.5 flex-wrap mt-3">
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Graphic
                            Design</a>
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Website
                            Design</a>
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Figma</a>
                        </div>
                      </div>
                      <div className="line flex-shrink-0 w-px h-full bg-gray-300 max-sm:hidden"></div>
                      <div
                        className="project_more_info flex flex-shrink-0 max-sm:flex-wrap sm:flex-col sm:items-end items-start sm:gap-7 gap-4 max-sm:w-full sm:h-full">
                        <button
                          className="add_wishlist_btn w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full max-sm:order-1 hover:border-[#3d5999]"
                          onClick={toggleWishlist}
                        >
                          {isWishlist ? (
                            <FaHeart size={18} weight="fill" className="text-red-500" />
                          ) : (
                            <FaHeart size={18} className="hover:text-[#3d5999]" />
                          )}
                        </button>
                        <div className="max-sm:w-full max-sm:order-[-1]">
                          <div className="project_proposals sm:text-end">
                            <span className="text-sm text-gray-600">Proposals: </span>
                            <span className="proposals text-sm font-medium">50+</span>
                          </div>
                          <div className="project_price sm:text-end mt-1">
                            <span className="price text-black font-bold">$170</span>
                            <span className="text-sm text-gray-600">/fixed-price</span>
                          </div>
                        </div>
                        <a href="#" className="button-main border bg-[#edf7f7] border-[#3d5999] text-[#3d5999] px-6 py-3 rounded-full h-fit hover:bg-[#3d5999] hover:text-white text-sm">See more</a>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="project_item py-5 px-6 rounded-lg bg-white duration-300 shadow-md hover:shadow-lg">
                    <div className="project_innner flex max-sm:flex-col items-center justify-between xl:gap-9 gap-6 h-full">
                      <div className="project_info">
                        <a href="#"
                          className="project_name text-lg text-[#3d5999] font-bold duration-300 hover:text-[#000000] hover:underline">Web & Responsive
                          for an Online Tutoring Website</a>
                        <div className="project_related_info flex flex-wrap items-center gap-3 mt-3">
                          <div className="project_date flex items-center gap-1">
                            <FaCalendarAlt size={14} className="text-gray-600" />
                            <span className="text-sm text-gray-600">2 days ago</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt size={14} className="text-gray-600" />
                            <span className="project_address text-sm text-gray-600">Las Vegas, USA</span>
                          </div>
                          <div className="project_spent flex items-center gap-1">
                            <FaDollarSign size={14} className="text-gray-600" />
                            <span className="text-sm text-gray-600">2.8K</span>
                            <span className="text-sm text-gray-600">spent</span>
                          </div>
                          <div className="project_rate flex items-center gap-1">
                            <span className="rate text-sm text-gray-600">4.8</span>
                            <FaStar weight="fill" size={14} className="text-yellow-400 -mt-0.5" />
                          </div>
                        </div>
                        <p className="project_desc mt-3 text-gray-600 text-sm">I am looking for a talented UX/UI
                          Designer to create screens for my basic product idea. The project involves
                          designing a web application, you may be missing out...</p>
                        <div className="list_tag flex items-center gap-2.5 flex-wrap mt-3">
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Graphic
                            Design</a>
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Website
                            Design</a>
                          <a href="#"
                            className="project_tag tag bg-gray-100 text-xs px-3 py-1 rounded-full hover:text-white hover:bg-[#3d5999]">Figma</a>
                        </div>
                      </div>
                      <div className="line flex-shrink-0 w-px h-full bg-gray-300 max-sm:hidden"></div>
                      <div
                        className="project_more_info flex flex-shrink-0 max-sm:flex-wrap sm:flex-col sm:items-end items-start sm:gap-7 gap-4 max-sm:w-full sm:h-full">
                        <button
                          className="add_wishlist_btn w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full max-sm:order-1 hover:border-[#3d5999]"
                          onClick={toggleWishlist}
                        >
                          {isWishlist ? (
                            <FaHeart size={18} weight="fill" className="text-red-500" />
                          ) : (
                            <FaHeart size={18} className="hover:text-[#3d5999]" />
                          )}
                        </button>
                        <div className="max-sm:w-full max-sm:order-[-1]">
                          <div className="project_proposals sm:text-end">
                            <span className="text-sm text-gray-600">Proposals: </span>
                            <span className="proposals text-sm font-medium">50+</span>
                          </div>
                          <div className="project_price sm:text-end mt-1">
                            <span className="price text-black font-bold">$170</span>
                            <span className="text-sm text-gray-600">/fixed-price</span>
                          </div>
                        </div>
                        <a href="#" className="button-main bg-[#edf7f7] border border-[#3d5999] text-[#3d5999] px-6 py-3 rounded-full h-fit hover:bg-[#3d5999] hover:text-white text-sm">See more</a>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      <button className="scroll-to-top-btn fixed bottom-8 right-8 w-12 h-12 bg-[#3d5999] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2d4373]">
        <FaCaretUp size={24} />
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="menu_mobile fixed inset-0 bg-white z-50 overflow-y-auto">
          <button
            className="menu_mobile_close flex items-center justify-center absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-[#3d5999] hover:text-white"
            onClick={toggleMobileMenu}
          >
            <FaTimes size={20} />
          </button>
          <div className="heading flex items-center justify-center mt-5">
            <a href="#" className="logo">
              <img src="/assets/images/logo.png" alt="logo" className="h-8" />
            </a>
          </div>
          <form className="form-search relative mt-4 mx-5">
            <button className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer">
              <FaSearch size={16} className="block text-gray-400" />
            </button>
            <input type="text" placeholder="What are you looking for?"
              className="h-12 rounded-lg border border-gray-300 text-sm w-full pl-10 pr-4 focus:border-[#3d5999] focus:outline-none" required />
          </form>
          <div className="mt-4">
            <ul className="nav_mobile px-5">
              <li className="nav_item py-3 border-b border-gray-200">
                <a href="#!" className="text-lg font-semibold flex items-center justify-between hover:text-[#3d5999]">
                  Homepages
                  <span className="text-right">
                    <FaCaretRight size={16} />
                  </span>
                </a>
              </li>
              <li className="nav_item py-3 border-b border-gray-200">
                <a href="#!" className="text-lg font-semibold flex items-center justify-between hover:text-[#3d5999]">
                  For Candidates
                  <span className="text-right">
                    <FaCaretRight size={16} />
                  </span>
                </a>
              </li>
              <li className="nav_item py-3 border-b border-gray-200">
                <a href="#!" className="text-lg font-semibold flex items-center justify-between hover:text-[#3d5999]">
                  For Employers
                  <span className="text-right">
                    <FaCaretRight size={16} />
                  </span>
                </a>
              </li>
              <li className="nav_item py-3 border-b border-gray-200">
                <a href="#!" className="text-lg font-semibold flex items-center justify-between hover:text-[#3d5999]">
                  Blogs
                  <span className="text-right">
                    <FaCaretRight size={16} />
                  </span>
                </a>
              </li>
              <li className="nav_item py-3">
                <a href="#!" className="text-lg font-semibold flex items-center justify-between hover:text-[#3d5999]">
                  Pages
                  <span className="text-right">
                    <FaCaretRight size={16} />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        title="Apply Projects"
        visible={isApplyModalOpen}
        onOk={handleApplyOk}
        onCancel={handleApplyCancel}
        footer={null}
        width={660}
      >
        <form className="p-6">
          <div className="cover_letter">
            <label htmlFor="cover_letter" className="block text-sm font-medium mb-2">Cover letter <span className="text-red-500">*</span></label>
            <textarea id="cover_letter" name="cover_letter"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded focus:border-[#3d5999] focus:outline-none"
              placeholder="Enter your cover letter" required></textarea>
          </div>
          <div className="file mt-5">
            <label htmlFor="file_attached" className="block text-sm font-medium mb-2">Attach file: <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap items-center gap-2 w-full">
              <div className="upload_file flex items-center gap-3 w-[220px] px-3 py-2 border border-gray-300 rounded hover:border-[#3d5999]">
                <label htmlFor="file_attached"
                  className="text-xs py-1 px-3 rounded bg-gray-200 whitespace-nowrap cursor-pointer hover:bg-[#3d5999] hover:text-white">Choose File</label>
                <input type="file" name="file_attached" id="file_attached" className="text-xs cursor-pointer hidden"
                  required />
              </div>
              <span className="text-xs text-gray-600">Up to 200 MB</span>
            </div>
          </div>
          <Button
            type="primary"
            className="w-full h-12 mt-5 text-lg font-semibold bg-[#3d5999] hover:bg-[#2d4373]"
          >
            Apply Now
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;