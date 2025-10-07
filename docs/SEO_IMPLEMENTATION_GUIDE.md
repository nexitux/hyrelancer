# SEO Implementation Guide for Hyrelancer

This guide shows you exactly when and how to implement SEO for different page types in your application.

## 🎯 **Quick Decision Tree**

```
Do you need custom metadata for this page?
├── NO → Don't add any SEO code (uses global defaults)
└── YES → Choose implementation pattern:
    ├── Title only → usePageSEO({ title: "Page Title" })
    ├── Standard → usePageSEO({ title, description, canonical })
    └── Full → usePageSEO({ title, description, og, twitter, scripts })
```

## 📋 **Page-by-Page Implementation Plan**

### **Tier 1: Critical Pages (Always Customize)**

#### Home Page ✅ (Already Done)
```jsx
// src/app/(public)/page.jsx
const seoComponent = usePageSEO({
  title: 'Home',
  description: 'Welcome to Hyrelancer...',
  og: { image: '/images/home-og.jpg' }
});
```

#### Job Listings Page ✅ (Already Done)
```jsx
// src/app/(public)/job-details/page.jsx
const seoComponent = usePageSEO({
  title: 'Job Listings',
  description: 'Browse and find the best freelance jobs...',
  canonical: '/job-details'
});
```

#### Individual Job Pages (To Do)
```jsx
// src/app/(public)/job-details/[id]/page.jsx
export default function JobDetailsPage({ params }) {
  const { job } = await getJob(params.id);
  
  const seoComponent = usePageSEO({
    title: job.title,
    description: job.description,
    canonical: `/job-details/${job.id}`,
    og: {
      title: `${job.title} - Hyrelancer`,
      image: job.image || '/images/default-job-og.jpg',
      type: 'article'
    }
  });

  return (
    <>
      {seoComponent}
      <div>Job content</div>
    </>
  );
}
```

### **Tier 2: Important Pages (Customize Key Fields)**

#### Service Pages
```jsx
// src/app/(public)/services/[slug]/page.jsx
export default function ServicePage({ params }) {
  const { service } = await getService(params.slug);
  
  const seoComponent = usePageSEO({
    title: service.name,
    description: service.description,
    canonical: `/services/${service.slug}`,
    og: { image: service.image }
  });

  return (
    <>
      {seoComponent}
      <div>Service content</div>
    </>
  );
}
```

#### User Profile Pages
```jsx
// src/app/(public)/profileView/[slug]/page.jsx
export default function ProfilePage({ params }) {
  const { user } = await getUser(params.slug);
  
  const seoComponent = usePageSEO({
    title: `${user.name} - Freelancer`,
    description: user.bio,
    canonical: `/profile/${user.slug}`,
    og: { 
      image: user.avatar,
      type: 'profile'
    }
  });

  return (
    <>
      {seoComponent}
      <div>Profile content</div>
    </>
  );
}
```

### **Tier 3: Standard Pages (Use Defaults)**

#### Dashboard Pages (No SEO needed)
```jsx
// src/app/(freelancer)/freelancer-dashboard/page.jsx
export default function FreelancerDashboard() {
  // No SEO code - uses global defaults
  return <div>Dashboard content</div>;
}
```

#### Settings Pages (No SEO needed)
```jsx
// src/app/(freelancer)/freelancer-dashboard/Changepassword/page.jsx
export default function ChangePassword() {
  // No SEO code - uses global defaults
  return <div>Change password form</div>;
}
```

## 🚀 **Implementation Patterns**

### **Pattern 1: No SEO (Most Pages)**
```jsx
export default function MyPage() {
  // No SEO code needed
  return <div>Content</div>;
}
```

### **Pattern 2: Title Only**
```jsx
export default function AboutPage() {
  const seoComponent = usePageSEO({
    title: 'About Us'
  });

  return (
    <>
      {seoComponent}
      <div>About content</div>
    </>
  );
}
```

### **Pattern 3: Standard SEO**
```jsx
export default function ContactPage() {
  const seoComponent = usePageSEO({
    title: 'Contact Us',
    description: 'Get in touch with our team.',
    canonical: '/contact'
  });

  return (
    <>
      {seoComponent}
      <div>Contact content</div>
    </>
  );
}
```

### **Pattern 4: Dynamic SEO**
```jsx
export default function DynamicPage({ data }) {
  const seoComponent = usePageSEO({
    title: data.title,
    description: data.description,
    og: { image: data.image }
  });

  return (
    <>
      {seoComponent}
      <div>Dynamic content</div>
    </>
  );
}
```

## 📊 **Recommended Implementation Schedule**

### **Phase 1: Critical Pages (Week 1)**
- [x] Home page
- [x] Job listings page
- [ ] Individual job pages
- [ ] Service pages
- [ ] User profile pages

### **Phase 2: Important Pages (Week 2)**
- [ ] About page
- [ ] Contact page
- [ ] FAQ page
- [ ] Category pages

### **Phase 3: Content Pages (Week 3)**
- [ ] Blog posts
- [ ] Help articles
- [ ] Terms and conditions

### **Phase 4: Dashboard Pages (Optional)**
- [ ] Freelancer dashboard
- [ ] Customer dashboard
- [ ] Admin pages

## 💡 **Pro Tips**

1. **Start with critical pages** - Focus on pages that drive traffic first
2. **Use templates** - Create reusable SEO patterns for similar page types
3. **Test as you go** - Use the testing checklist for each page
4. **Don't over-optimize** - Dashboard pages don't need custom SEO
5. **Keep it simple** - Only add what you need

## 🔧 **Quick Setup for New Pages**

### **Step 1: Decide if you need custom SEO**
- Is this a public page that users might find via search?
- Does it have unique content that should be indexed?
- Will it be shared on social media?

### **Step 2: Choose your pattern**
- **No SEO**: Don't add any code
- **Title only**: `usePageSEO({ title: "Page Title" })`
- **Standard**: `usePageSEO({ title, description, canonical })`
- **Full**: `usePageSEO({ title, description, og, twitter, scripts })`

### **Step 3: Test your implementation**
- Check the page title in browser tab
- View page source to verify meta tags
- Test social media previews

## 📈 **Expected Results**

After implementing SEO for critical pages:
- **Better search rankings** for important pages
- **Improved social media sharing** with rich previews
- **Consistent branding** across all pages
- **Easy maintenance** with centralized defaults

Remember: **You don't need to add SEO to every page!** Start with the most important ones and expand gradually.
