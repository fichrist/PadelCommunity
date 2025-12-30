# Sacred Paths Connect - Architecture

## Hybrid Supabase Architecture (Recommended for Social Media)

This project uses a **hybrid architecture** that leverages the best of both worlds:

### 🎯 Architecture Overview

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌─────────────┐
│  Supabase    │  │   Backend   │
│  (Direct)    │  │   API       │
└──────────────┘  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Supabase   │
                  │ (Server SDK)│
                  └─────────────┘
```

## When to Use Frontend → Supabase (Direct)

### ✅ Use Frontend Supabase Client For:

#### 1. **Authentication** 🔐
```typescript
// Frontend: packages/frontend/src/lib/supabase.ts
import { supabase } from '@/lib/supabase'

// Sign up
await supabase.auth.signUp({ email, password })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

**Why?** Supabase Auth handles sessions, tokens, and security automatically.

#### 2. **Real-time Features** ⚡
```typescript
// Frontend: Subscribe to new posts
supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('New post!', payload)
    }
  )
  .subscribe()

// Real-time chat messages
supabase
  .channel('messages')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    handleNewMessage
  )
  .subscribe()
```

**Why?** Supabase's real-time engine is faster than polling your backend.

#### 3. **Simple CRUD Operations** 📝
```typescript
// Frontend: Read posts with RLS protection
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })

// Create a post (RLS checks user is authenticated)
const { data: newPost } = await supabase
  .from('posts')
  .insert({ title, content, user_id: user.id })
  .select()
  .single()

// Update user's own post (RLS enforces ownership)
await supabase
  .from('posts')
  .update({ title: newTitle })
  .eq('id', postId)
  .eq('user_id', user.id)
```

**Why?** Direct access is faster, and Row Level Security (RLS) ensures data safety.

#### 4. **File Uploads** 📎
```typescript
// Frontend: Upload profile picture
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/profile.jpg`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/profile.jpg`)
```

**Why?** Supabase Storage handles large files efficiently with CDN support.

#### 5. **User Profiles & Settings** 👤
```typescript
// Frontend: Get profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Update own profile (protected by RLS)
await supabase
  .from('profiles')
  .update({ bio, avatar_url })
  .eq('id', user.id)
```

**Why?** Simple operations don't need backend overhead.

---

## When to Use Frontend → Backend API

### ✅ Use Backend API For:

#### 1. **Complex Business Logic** 🧮
```typescript
// Backend: packages/backend/src/index.ts
app.post('/api/posts/:id/moderate', async (req, res) => {
  // Complex content moderation
  const post = await getPost(req.params.id)
  const toxicityScore = await analyzeContent(post.content)
  const hasInappropriateImages = await scanImages(post.images)
  
  if (toxicityScore > 0.8 || hasInappropriateImages) {
    await flagPost(post.id)
    await notifyModerators(post.id)
  }
  
  res.json({ moderated: true })
})
```

**Why?** Keep complex logic on the server for security and maintainability.

#### 2. **Third-Party API Integrations** 🔌
```typescript
// Backend: Send email notifications
app.post('/api/notifications/email', async (req, res) => {
  // Use SendGrid, Mailgun, etc.
  await emailService.send({
    to: req.body.email,
    subject: 'New follower!',
    template: 'new-follower',
    data: req.body
  })
  
  res.json({ sent: true })
})

// Backend: Payment processing
app.post('/api/subscriptions/create', async (req, res) => {
  // Stripe integration
  const session = await stripe.checkout.sessions.create({
    // ... payment details
  })
  
  res.json({ sessionId: session.id })
})
```

**Why?** API keys must stay secret on the server.

#### 3. **Data Aggregation & Analytics** 📊
```typescript
// Backend: Generate user analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  const userId = req.user.id
  
  const stats = {
    totalPosts: await countUserPosts(userId),
    totalFollowers: await countFollowers(userId),
    engagementRate: await calculateEngagement(userId),
    topPosts: await getTopPostsByEngagement(userId, 5),
    growthData: await getGrowthMetrics(userId, '30days')
  }
  
  res.json(stats)
})
```

**Why?** Complex queries and calculations are better on the server.

#### 4. **Scheduled Tasks & Background Jobs** ⏰
```typescript
// Backend: Cron job for daily digest
cron.schedule('0 8 * * *', async () => {
  const users = await getActiveUsers()
  
  for (const user of users) {
    const digest = await generateDailyDigest(user.id)
    await sendDigestEmail(user.email, digest)
  }
})

// Backend: Cleanup old data
cron.schedule('0 2 * * *', async () => {
  await deleteOldNotifications()
  await archiveInactivePosts()
})
```

**Why?** Frontend can't run scheduled tasks.

#### 5. **Admin Operations** 👑
```typescript
// Backend: Bulk operations (admin only)
app.post('/api/admin/users/ban', async (req, res) => {
  // Verify admin role
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  const { userIds } = req.body
  
  // Ban multiple users
  await supabase
    .from('profiles')
    .update({ banned: true, banned_at: new Date() })
    .in('id', userIds)
  
  // Send notifications
  await notifyBannedUsers(userIds)
  
  res.json({ banned: userIds.length })
})
```

**Why?** Admin operations need extra server-side validation.

#### 6. **Rate Limiting & Abuse Prevention** 🛡️
```typescript
// Backend: Rate-limited endpoint
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.post('/api/posts', limiter, async (req, res) => {
  // Create post with server-side validation
  const post = await createPost(req.body)
  res.json(post)
})
```

**Why?** Rate limiting must be enforced server-side.

---

## 🔒 Security: Row Level Security (RLS)

Supabase's RLS policies protect your data even with direct frontend access:

```sql
-- Example RLS Policy: Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON posts
FOR UPDATE
USING (auth.uid() = user_id);

-- Example: Users can read all public posts
CREATE POLICY "Anyone can view public posts"
ON posts
FOR SELECT
USING (is_public = true);

-- Example: Users can only read their own messages
CREATE POLICY "Users can read own messages"
ON messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```

**This is why direct frontend access is safe!** The database enforces rules.

---

## 📁 Code Organization

### Frontend Supabase Client
**Location**: `packages/frontend/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Backend Supabase Client
**Location**: `packages/backend/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

// Backend can use service_role key for admin operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
```

---

## 🎯 Decision Tree

```
Need to do something?
│
├─ Is it authentication?
│  └─ YES → Frontend Supabase ✅
│
├─ Is it real-time?
│  └─ YES → Frontend Supabase ✅
│
├─ Is it simple CRUD with RLS?
│  └─ YES → Frontend Supabase ✅
│
├─ Is it file upload/download?
│  └─ YES → Frontend Supabase ✅
│
├─ Does it need API keys?
│  └─ YES → Backend API ✅
│
├─ Is it complex business logic?
│  └─ YES → Backend API ✅
│
├─ Does it need scheduled tasks?
│  └─ YES → Backend API ✅
│
└─ Is it admin/bulk operation?
   └─ YES → Backend API ✅
```

---

## 🚀 Benefits of This Architecture

1. **Performance** - Direct Supabase access is faster for simple operations
2. **Real-time** - Native real-time subscriptions without custom WebSockets
3. **Scalability** - Supabase handles load, your backend only for complex tasks
4. **Security** - RLS enforces data access rules at database level
5. **Developer Experience** - Use the right tool for each job
6. **Cost Effective** - Reduce backend load and hosting costs

---

## 📚 Resources

- **Frontend Supabase**: `packages/frontend/src/integrations/supabase/`
- **Backend API**: `packages/backend/src/index.ts`
- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## 💡 Example: Creating a Post (Full Flow)

### Simple Post (Frontend → Supabase)
```typescript
// Frontend: Quick post creation
const { data } = await supabase
  .from('posts')
  .insert({ 
    title, 
    content, 
    user_id: user.id 
  })
```

### Moderated Post (Frontend → Backend → Supabase)
```typescript
// Frontend: Post that needs moderation
const response = await fetch('http://localhost:3001/api/posts/moderated', {
  method: 'POST',
  body: JSON.stringify({ title, content }),
  headers: { 'Content-Type': 'application/json' }
})

// Backend: Moderate before saving
app.post('/api/posts/moderated', async (req, res) => {
  const { title, content } = req.body
  
  // Run AI moderation
  const moderationResult = await moderateContent(content)
  
  if (moderationResult.approved) {
    const { data } = await supabase
      .from('posts')
      .insert({ title, content, user_id: req.user.id })
    
    res.json(data)
  } else {
    res.status(400).json({ error: 'Content violates guidelines' })
  }
})
```

---

**This hybrid architecture gives you the best of both worlds for a social media app!** 🎉
