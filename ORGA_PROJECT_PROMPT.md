# ORGA - Organizational Workflow & Task Management Platform

## Project Overview

ORGA is a full-stack organizational workflow and task management platform designed for hierarchical organizations with three distinct user roles: CEO, Manager, and Employee. The platform optimizes task distribution, tracks performance, enables team communication, and manages organizational accountability.

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite build tool
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom luxury color scheme
- **UI Components**: Shadcn/UI component library
- **State Management**: React Context API (AuthContext)
- **Routing**: React Router v6
- **Charts**: Recharts for analytics visualizations
- **Animations**: TailwindCSS Animate

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage (resumes, task-files buckets)
- **Realtime**: Supabase Realtime for notifications, messages, and work sessions

### Data Structures & Algorithms
- **Min Heap**: Balanced task assignment to least-busy employees by rank
- **Priority Queue**: Notification and approval processing
- **Linked List**: Employee task history and activity timeline
- **Tree**: Organization hierarchy visualization (CEO as root)
- **Graph (Adjacency List)**: Group-member relationships and multi-group membership
- **HashMap**: Fast ID lookups for employees and tasks

---

## Color Scheme & Design System

### Primary Colors (Luxury Formal Aesthetic)
- **Navy Blue** (`#1B2A49`): Headers, primary buttons
- **Charcoal Gray** (`#2B2B2B`): Backgrounds, cards
- **White** (`#FFFFFF`): Text, card backgrounds
- **Gold** (`#D4AF37`): Luxury accents, highlights
- **Soft Copper** (`#B87333`): Secondary highlights

### Status Colors
- **Green** (`#28A745`): On-time completion
- **Red** (`#DC3545`): Overdue
- **Orange** (`#FFC107`): Late completion
- **Black** (`#343A40`): Accountability marks

---

## User Roles & Permissions

### CEO (Role: "CEO")
- Creates organization (org name, password, description)
- Automatically approved upon registration (no resume upload needed)
- Custom ID: `CEO001`
- **Full Access**:
  - View/manage all employees, managers, groups
  - Approve pending users and assign ranks (S-E)
  - Create/assign tasks to individuals, groups, or ranks
  - View all analytics and performance metrics
  - Access all documents (resumes, task files, complaints with submitter names)
  - Chat with anyone (groups, individuals)
  - Ban/unban users from organization
  - Remove users from organization

### Manager (Role: "Manager")
- Joins existing organization with org name and password
- Uploads resume, waits for CEO approval
- Custom ID: `MNRXXXXX`
- **Permissions**:
  - Approve employees (not other managers)
  - Create/assign tasks to individuals, groups, or ranks
  - Manage groups (create, edit, add/remove members)
  - View all employees in organization
  - Access documents (resumes, task files, complaints - submitter names hidden as "Anonymous")
  - Chat with anyone (groups, individuals)
  - View analytics and performance metrics

### Employee (Role: "Employee")
- Joins existing organization with org name and password
- Uploads resume, waits for CEO/Manager approval
- Custom ID: `EMPXXXXX`
- **Permissions**:
  - View and complete assigned tasks
  - Track work time with start/pause/resume functionality
  - Upload files to tasks as progress submissions
  - View own groups only
  - Submit complaints (visible to CEO/Manager)
  - Chat with managers and own groups only
  - Receive messages from CEO (cannot reply to CEO)
  - View own performance metrics

---

## Database Schema

### Tables

#### `organizations`
- `id` (UUID, PK)
- `org_name` (TEXT, NOT NULL)
- `org_password` (TEXT, NOT NULL) - Hashed password for joining
- `description` (TEXT)
- `created_by` (UUID) - References auth.users
- `created_at` (TIMESTAMP)

#### `profiles`
- `id` (UUID, PK)
- `user_id` (UUID, NOT NULL) - References auth.users
- `org_id` (UUID) - References organizations
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `role` (TEXT, NOT NULL) - "CEO", "Manager", "Employee"
- `rank` (TEXT) - "S", "A", "B", "C", "D", "E"
- `custom_id` (TEXT) - Generated ID (CEO001, MNRXXXXX, EMPXXXXX)
- `approved` (BOOLEAN, DEFAULT false)
- `resume_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### `groups`
- `id` (UUID, PK)
- `group_name` (TEXT, NOT NULL)
- `group_rank` (TEXT) - For visualization only
- `org_id` (UUID, NOT NULL)
- `leader_id` (UUID)
- `created_by` (UUID)
- `created_at` (TIMESTAMP)

#### `group_members`
- `id` (UUID, PK)
- `group_id` (UUID, NOT NULL)
- `profile_id` (UUID, NOT NULL)
- `joined_at` (TIMESTAMP)

#### `tasks`
- `id` (UUID, PK)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (TEXT, DEFAULT 'assigned') - "assigned", "in_progress", "completed"
- `priority` (INTEGER, DEFAULT 1)
- `due_date` (TIMESTAMP, NOT NULL)
- `assignment_type` (TEXT, NOT NULL) - "individual", "group", "rank", "everyone"
- `assigned_rank` (TEXT) - For rank-based assignment
- `assigned_by` (UUID, NOT NULL)
- `org_id` (UUID, NOT NULL)
- `completed_at` (TIMESTAMP)
- `overdue_flag` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMP)

#### `task_assignments`
- `id` (UUID, PK)
- `task_id` (UUID, NOT NULL)
- `profile_id` (UUID)
- `group_id` (UUID)
- `is_completed` (BOOLEAN, DEFAULT false)
- `completed_by_profile_id` (UUID)
- `assigned_at` (TIMESTAMP)

#### `task_files`
- `id` (UUID, PK)
- `task_id` (UUID, NOT NULL)
- `profile_id` (UUID, NOT NULL)
- `file_name` (TEXT, NOT NULL)
- `file_url` (TEXT, NOT NULL)
- `uploaded_at` (TIMESTAMP)

#### `work_sessions`
- `id` (UUID, PK)
- `task_id` (UUID, NOT NULL)
- `profile_id` (UUID, NOT NULL)
- `started_at` (TIMESTAMP, NOT NULL)
- `ended_at` (TIMESTAMP)
- `duration_minutes` (INTEGER, DEFAULT 0)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)

#### `black_marks`
- `id` (UUID, PK)
- `profile_id` (UUID, NOT NULL)
- `task_id` (UUID, NOT NULL)
- `reason` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP)

#### `notifications`
- `id` (UUID, PK)
- `profile_id` (UUID, NOT NULL)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL)
- `read` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMP)

#### `complaints`
- `id` (UUID, PK)
- `org_id` (UUID, NOT NULL)
- `submitted_by` (UUID, NOT NULL)
- `subject` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `status` (TEXT, DEFAULT 'pending') - "pending", "reviewed", "resolved"
- `resolved_by` (UUID)
- `resolved_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

#### `conversations`
- `id` (UUID, PK)
- `type` (TEXT, NOT NULL) - "direct", "group"
- `group_id` (UUID) - For group chats
- `org_id` (UUID, NOT NULL)
- `created_at`, `updated_at` (TIMESTAMP)

#### `conversation_participants`
- `id` (UUID, PK)
- `conversation_id` (UUID, NOT NULL)
- `profile_id` (UUID, NOT NULL)
- `joined_at` (TIMESTAMP)

#### `messages`
- `id` (UUID, PK)
- `conversation_id` (UUID, NOT NULL)
- `sender_id` (UUID, NOT NULL)
- `content` (TEXT, NOT NULL)
- `read_by` (UUID[])
- `created_at` (TIMESTAMP)

#### `banned_users`
- `id` (UUID, PK)
- `user_id` (UUID, NOT NULL)
- `org_id` (UUID, NOT NULL)
- `banned_by` (UUID, NOT NULL)
- `reason` (TEXT)
- `banned_at` (TIMESTAMP)

---

## Features

### 1. Authentication & Onboarding
- Email/password authentication with auto-confirm enabled
- CEO creates organization → Goes directly to dashboard
- Manager/Employee joins org → Uploads resume → Waits for approval → Gets rank assigned

### 2. Task Management
- **Assignment Types**:
  - Individual: Assign to specific employee
  - Group: All members must complete individually for full completion
  - Rank: Uses Min Heap to assign to least-busy employee of that rank
  - Everyone: First to complete marks it done for all
- **Status Tracking**: Assigned → In Progress → Completed
- **Overdue Detection**: Daily check, marks tasks red if past due date
- **File Uploads**: Multiple PDFs/images per task

### 3. Work Time Tracking
- Start/Pause/Resume timer per task
- Accumulated time persists across sessions
- Auto-sets task status to "in_progress" when work starts

### 4. Groups
- CEO/Manager creates groups with optional leader
- Users can belong to multiple groups
- Group rank is for visualization only (individual rank used for task assignment)

### 5. Analytics & Performance
- Charts: Completed (green), Overdue (red), Late-completed (orange)
- Time Filters: Last 7 days, Last month, Last quarter, All time
- Performance metrics by employee, rank, and group

### 6. Complaints System
- All users can submit complaints
- Employees see only their own complaints
- Managers see all complaints (submitter names hidden as "Anonymous")
- CEO sees all complaints with full submitter information

### 7. Documents Center (CEO/Manager only)
- Centralized view of all resumes
- All task file submissions
- All complaints with role-based visibility

### 8. Chat System
- **CEO/Manager**: Can chat with anyone (groups, individuals, or broadcast)
- **Employee**: Can chat with managers and own groups only; can receive but not send messages to CEO
- Real-time messaging via Supabase Realtime
- Group chat for all group members

### 9. User Management
- CEO can ban/unban users
- Banned users removed from organization and prevented from rejoining
- CEO/Manager can edit employee ranks at any time

### 10. Notifications
- Real-time via Supabase Realtime (not pull-based)
- Types: Task assignments, completions, overdue alerts, approval status, group invites

---

## Navigation Structure

### Desktop
- Left sidebar: 60px collapsed (icons only), 250px expanded (on hover)
- Auto-hides if no mouse activity

### Mobile
- Bottom tab bar: Dashboard, My Tasks, Notifications, Profile
- Hamburger menu: Analytics, Groups, Admin pages

---

## File Structure

```
src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # Entry point
├── index.css                        # Global styles & design tokens
├── contexts/
│   └── AuthContext.tsx              # Authentication context
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx      # Main layout wrapper
│   │   ├── Sidebar.tsx              # Desktop sidebar navigation
│   │   └── MobileNav.tsx            # Mobile bottom navigation
│   ├── ui/                          # Shadcn UI components
│   └── ProtectedRoute.tsx           # Route protection wrapper
├── hooks/
│   ├── useOrgData.ts                # Organization data fetching
│   ├── useNotifications.ts          # Notifications management
│   ├── useWorkSessions.ts           # Work time tracking
│   └── useChat.ts                   # Chat & messaging
├── pages/
│   ├── Index.tsx                    # Landing/welcome page
│   ├── Auth.tsx                     # Login/signup
│   ├── CompleteProfile.tsx          # Onboarding form
│   ├── PendingApproval.tsx          # Waiting for approval screen
│   ├── PendingApprovals.tsx         # Approval management (CEO/Manager)
│   ├── CEODashboard.tsx             # CEO dashboard
│   ├── ManagerDashboard.tsx         # Manager dashboard
│   ├── EmployeeDashboard.tsx        # Employee dashboard
│   ├── Employees.tsx                # Employee list & management
│   ├── AllTasks.tsx                 # All tasks view
│   ├── CreateTask.tsx               # Task creation form
│   ├── MyTasks.tsx                  # Employee's assigned tasks
│   ├── Groups.tsx                   # Group management
│   ├── MyGroups.tsx                 # Employee's groups
│   ├── Analytics.tsx                # Analytics dashboard
│   ├── Performance.tsx              # Employee performance view
│   ├── Notifications.tsx            # Notification center
│   ├── Documents.tsx                # Documents viewer
│   ├── Complaints.tsx               # Complaints system
│   ├── Chat.tsx                     # Messaging interface
│   ├── BannedUsers.tsx              # Banned users management
│   └── Settings.tsx                 # User settings
├── integrations/supabase/
│   ├── client.ts                    # Supabase client (auto-generated)
│   └── types.ts                     # Database types (auto-generated)
└── lib/
    ├── utils.ts                     # Utility functions
    └── dsa/                         # Data structure implementations
        ├── MinHeap.js
        ├── Queue.js
        ├── LinkedList.js
        ├── Tree.js
        ├── Graph.js
        └── HashMap.js
```

---

## RLS Policies Summary

All tables have Row-Level Security enabled with policies based on:
- Organization membership (`org_id` check)
- Role-based access (CEO, Manager, Employee)
- Ownership (user's own data)

---

## Key Implementation Notes

1. **Organization Password**: Stored as hashed value, compared via hash during join validation
2. **Custom ID Generation**: Database function generates IDs (CEO001, MNRXXXXX, EMPXXXXX)
3. **CEO Auto-Approval**: Database trigger automatically approves CEO profiles
4. **Realtime Enabled**: messages, work_sessions, conversations tables
5. **Storage Buckets**: `resumes` (public), `task-files` (private)
6. **No Manual Refresh**: Use Supabase Realtime subscriptions for live updates

---

## Security Considerations

- RLS policies enforce org-level data isolation
- Role-based access control at both RLS and UI level
- Banned users prevented from rejoining via database constraint
- Employees cannot view other employees' personal data
- Complaints anonymized for managers (only CEO sees submitter)
