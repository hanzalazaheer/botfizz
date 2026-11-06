/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChannelProvider } from "@/contexts/channel-context";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { SocketProvider } from "./contexts/socket-context";
import { useI18n } from "@/lib/i18n";
import { markExplored } from "@/lib/explored";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Inbox from "@/pages/inbox";
import Automations from "@/pages/automations";
import Analytics from "@/pages/analytics";
import CampaignAnalytics from "@/pages/campaign-analytics";
import Settings from "@/pages/settings";
import Team from "@/pages/team";
import Sidebar from "@/components/layout/sidebar";
import Account from "./pages/account";
import { AppLayout } from "./components/layout/AppLayout";
import ChatbotBuilder from "./pages/chatbot-builder";
import AddChatbotBuilder from "./pages/add-chatbot-builder";
import WidgetBuilder from "./pages/widget-builder";
import Websites from "./pages/websites";
import Home from "./pages/Home";
import LoadingAnimation from "./components/LoadingAnimation";
import BotFlowBuilder from "./pages/BotFlowBuilder";
import Workflows from "./pages/Workflows";
import AIAssistant from "./pages/AIAssistant";
import AutoResponses from "./pages/AutoResponses";
import WABAConnection from "./pages/WABAConnection";
import MultiNumber from "./pages/MultiNumbert";
import Webhooks from "./pages/Webhooks";
import QRCodes from "./pages/QRCodes";
import CRMSystem from "./pages/CRMSystem";
import LeadManagement from "./pages/LeadManagement";
import BulkImport from "./pages/BulkImport";
import Segmentation from "./pages/Segmentation";
import HealthMonitor from "./pages/HealthMonitor";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import UserNotifications from "./pages/UserNotifications";
import ChatHub from "./pages/ChatHub";
import User from "./pages/users";
import ContactsManagements from "./pages/contacts-managements";
import SupportTicketsNew from "./pages/support-tickets";
import userDetails from "./pages/userDetails";
import UserSupportTicketsNew from "./pages/user-support-tickets";
import GroupsUI from "./pages/group-list";
import MinimalLoader from "./components/MinimalLoader";
import { ScrollToTop } from "./components/ScrollToTop";
import LanguageManagement from "./pages/LanguageManagement";
import SuperadminMessageLogs from "./pages/SuperadminMessageLogs";
import ApiDocs from "./pages/api-docs";
import ChannelsManagement from "./pages/channels-management";

// Define route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/contacts": "contacts.view",
  "/campaigns": "campaigns.view",
  "/templates": "templates.view",
  "/inbox": "inbox.view",
  "/team": "team.view",
  "/automation": "automations.view",
  "/analytics": "analytics.view",
  // "/analytics/campaign/:campaignId": "analytics.view",
  "/logs": "logs.view",
  "/settings": "settings.view",
  "/account": "",
  "/bot-builder": "",
};

function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

// Permission wrapper component
function PermissionRoute({
  component: Component,
  requiredPermission,
  requiredRoles,
}: Readonly<{
  component: React.ComponentType;
  requiredPermission?: string;
  requiredRoles?: string[];
}>) {
  const { user } = useAuth();

  if (requiredRoles && requiredRoles.length > 0) {
    if (!user?.role || !requiredRoles.includes(user.role)) {
      return <UnauthorizedPage />;
    }
  }

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!user?.permissions) return false;
    if (user.role === "superadmin") return true;

    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);

    if (perms.includes("*")) return true;

    const normalize = (str: string) => str.replace(".", ":");

    return perms.some(
      (perm) =>
        perm.startsWith(normalize(permission)) &&
        (Array.isArray(user.permissions) ? true : user.permissions[perm])
    );
  };

  if (!hasPermission(requiredPermission)) {
    return <UnauthorizedPage />;
  }

  return <Component />;
}

function ProtectedRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Check flag immediately on mount - synchronously
  const fromLoginFlag =
    typeof window !== "undefined" &&
    sessionStorage.getItem("fromLogin") === "true";

  const [showLoading, setShowLoading] = useState(fromLoginFlag);
  const [isLoginRedirect] = useState(fromLoginFlag);

  // Clear flag immediately after reading
  useEffect(() => {
    if (fromLoginFlag) {
      sessionStorage.removeItem("fromLogin");
    }
  }, [fromLoginFlag]);

  useEffect(() => {
    if (isAuthenticated) markExplored(location);
  }, [location, isAuthenticated]);

  // Check if user has access to current route
  useEffect(() => {
    if (isAuthenticated && user && location !== "/") {
      const requiredPermission = ROUTE_PERMISSIONS[location];

      if (requiredPermission && !hasRoutePermission(requiredPermission, user)) {
        setLocation("/dashboard");
      }
    }
  }, [location, isAuthenticated, user, setLocation]);

  // Priority 1: Show login animation loader immediately
  if (showLoading && isLoginRedirect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <LoadingAnimation onComplete={() => setShowLoading(false)} />
      </div>
    );
  }

  // Priority 2: Show minimal loader during auth check
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <MinimalLoader onComplete={() => {}} duration={1500} color="green" />
      </div>
    );
  }

  // Priority 3: Not authenticated - demo login is the way in
  if (!isAuthenticated) {
    return <Redirect to={`/login?next=${encodeURIComponent(location)}`} />;
  }

  // Priority 4: Authenticated - show dashboard and protected routes
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/contacts">
            <PermissionRoute
              component={Contacts}
              requiredPermission="contacts:view"
            />
          </Route>
          <Route path="/users">
            <PermissionRoute component={User} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/channels-management">
            <PermissionRoute component={ChannelsManagement} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/users/:id">
            <PermissionRoute component={userDetails} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/campaigns">
            <PermissionRoute
              component={Campaigns}
              requiredPermission="campaigns:view"
            />
          </Route>
          <Route path="/templates">
            <PermissionRoute
              component={Templates}
              requiredPermission="templates:view"
            />
          </Route>
          <Route path="/inbox">
            <PermissionRoute
              component={Inbox}
              requiredPermission="inbox:view"
            />
          </Route>
          <Route path="/languages">
            <PermissionRoute component={LanguageManagement} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/team">
            <PermissionRoute component={Team} requiredPermission="team:view" />
          </Route>
          <Route path="/automation">
            <PermissionRoute
              component={Automations}
              requiredPermission="automations:view"
            />
          </Route>
          <Route path="/analytics">
            <PermissionRoute component={Analytics} />
          </Route>
          <Route path="/websites">
            <PermissionRoute component={Websites} />
          </Route>
          <Route path="/add/chatbot-builder">
            <PermissionRoute component={AddChatbotBuilder} />
          </Route>
          <Route path="/widget-builder">
            <PermissionRoute component={WidgetBuilder} />
          </Route>
          <Route path="/chatbot-builder">
            <PermissionRoute component={ChatbotBuilder} />
          </Route>
          <Route path="/settings">
            <PermissionRoute
              component={Settings}
              requiredPermission="settings:view"
            />
          </Route>
          <Route path="/analytics/campaign/:campaignId">
            <PermissionRoute
              component={CampaignAnalytics}
              // requiredPermission="settings:view"
            />
          </Route>
          <Route path="/account">
            <PermissionRoute component={Account} />
          </Route>
          <Route path="/bot-builder">
            <PermissionRoute component={BotFlowBuilder} />
          </Route>
          <Route path="/workflows">
            <PermissionRoute component={Workflows} />
          </Route>
          <Route path="/ai-assistant">
            <PermissionRoute component={AIAssistant} />
          </Route>
          <Route path="/auto-responses">
            <PermissionRoute component={AutoResponses} />
          </Route>
          <Route path="/waba-connection">
            <PermissionRoute component={WABAConnection} />
          </Route>
          <Route path="/multi-number">
            <PermissionRoute component={MultiNumber} />
          </Route>
          <Route path="/webhooks">
            <PermissionRoute component={Webhooks} />
          </Route>
          <Route path="/qr-codes">
            <PermissionRoute component={QRCodes} />
          </Route>
          <Route path="/crm-systems">
            <PermissionRoute component={CRMSystem} />
          </Route>
          <Route path="/leads">
            <PermissionRoute component={LeadManagement} />
          </Route>
          <Route path="/bulk-import">
            <PermissionRoute component={BulkImport} />
          </Route>
          <Route path="/segmentation">
            <PermissionRoute component={Segmentation} />
          </Route>
          <Route path="/message-logs">
            <PermissionRoute component={SuperadminMessageLogs} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/health-monitor">
            <PermissionRoute component={HealthMonitor} />
          </Route>
          <Route path="/reports">
            <PermissionRoute component={Reports} />
          </Route>
          <Route path="/contacts-management">
            <PermissionRoute component={ContactsManagements} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/support-tickets">
            <PermissionRoute component={SupportTicketsNew} requiredRoles={["superadmin"]} />
          </Route>
          <Route path="/groups">
            <PermissionRoute component={GroupsUI} />
          </Route>
          <Route path="/api-docs">
            <PermissionRoute component={ApiDocs} requiredRoles={["admin"]} />
          </Route>
          <Route path="/user-support-tickets">
            <PermissionRoute component={UserSupportTicketsNew} />
          </Route>
          <Route path="/notifications">
            <PermissionRoute component={Notifications} />
          </Route>
          <Route path="/user-notifications">
            <PermissionRoute component={UserNotifications} />
          </Route>
          <Route path="/chat-hub">
            <PermissionRoute component={ChatHub} />
          </Route>
          {["/plans", "/plan-upgrade", "/billing", "/gateway", "/master-subscriptions", "/transactions-logs"].map((path) => (
            <Route key={path} path={path}>
              <Redirect to="/dashboard" />
            </Route>
          ))}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

// Helper function to check route permissions
function hasRoutePermission(permission: string, user: any) {
  if (!user?.permissions) return false;
  if (user.role === "superadmin") return true;

  const perms = Array.isArray(user.permissions)
    ? user.permissions
    : Object.keys(user.permissions);

  if (perms.includes("*")) return true;

  const normalize = (str: string) => str.replace(".", ":");

  return perms.some(
    (perm: string) =>
      perm.startsWith(normalize(permission)) &&
      (Array.isArray(user.permissions) ? true : user.permissions[perm])
  );
}

// Custom hook for permission checking
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;

    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);

    const normalize = (str: string) => str.replace(".", ":");
    const normalizedPermission = normalize(permission);

    return perms.some(
      (perm) =>
        perm.startsWith(normalizedPermission) &&
        (Array.isArray(user.permissions) ? true : user.permissions[perm])
    );
  };

  const canAccessRoute = (route: string) => {
    const requiredPermission = ROUTE_PERMISSIONS[route];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };

  return { hasPermission, canAccessRoute, user };
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup">
          <Redirect to="/login" />
        </Route>
        <Route path="/verify-email">
          <Redirect to="/login" />
        </Route>
        {["/pricing", "/about", "/terms", "/privacy-policy"].map((path) => (
          <Route key={path} path={path}>
            <Redirect to="/" />
          </Route>
        ))}
        <Route path="/" component={Home} />
        <Route component={ProtectedRoutes} />
      </Switch>
    </>
  );
}

function App() {
  useEffect(() => {
    useI18n.getState().fetchEnabledLanguages();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <AuthProvider>
          <SocketProvider>
          <ChannelProvider>
            <TooltipProvider>
              <UnreadCountProvider>
                <Toaster />
                <Router />
              </UnreadCountProvider>
            </TooltipProvider>
          </ChannelProvider>
          </SocketProvider>
        </AuthProvider>
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
