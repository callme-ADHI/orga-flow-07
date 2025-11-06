import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import PendingApproval from "./pages/PendingApproval";
import PendingApprovals from "./pages/PendingApprovals";
import CEODashboard from "./pages/CEODashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import AllTasks from "./pages/AllTasks";
import CreateTask from "./pages/CreateTask";
import Groups from "./pages/Groups";
import MyTasks from "./pages/MyTasks";
import MyGroups from "./pages/MyGroups";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* CEO Routes */}
            <Route
              path="/ceo-dashboard"
              element={
                <ProtectedRoute allowedRoles={["CEO"]}>
                  <CEODashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Manager Routes */}
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Employee Routes */}
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Shared Routes (CEO & Manager) */}
            <Route
              path="/pending-approvals"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <PendingApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-tasks"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <AllTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-task"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <CreateTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["CEO", "Manager"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            {/* Employee-only Routes */}
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-groups"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <MyGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <Performance />
                </ProtectedRoute>
              }
            />
            
            {/* Common Routes (All authenticated users) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
