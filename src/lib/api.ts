// Base URLs come from environment variables (for Next.js use NEXT_PUBLIC_*)
const BUSINESS_API_BASE_URL =
  process.env.NEXT_PUBLIC_BUSINESS_API_BASE_URL ||
  "https://railji-business-stage.onrender.com/business/v1";
const DASHBOARD_API_BASE_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_BASE_URL ||
  "https://railji-dashboard-stage.onrender.com/dashboard/v1";

export const API_ENDPOINTS = {
  // Auth
  signIn: `${DASHBOARD_API_BASE_URL}/users/login`,

  // Departments
  departments: `${BUSINESS_API_BASE_URL}/departments`,
  
  // Departments with supabaseId (for user access management)
  userDepartments: (supabaseId: string) =>
    `${BUSINESS_API_BASE_URL}/departments/${supabaseId}/departments`,

  // Papers - Business API
  papers: (departmentId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}${page ? `?page=${page}` : ""}`,
  generalPapers: (page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/general?paperType=general${page ? `&page=${page}` : ""}`,
  
  // Papers with supabaseId (for user access management)
  userPapers: (supabaseId: string, departmentId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/user/${supabaseId}${page ? `?page=${page}` : ""}`,
  userGeneralPapers: (supabaseId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/general/user/${supabaseId}?paperType=general${page ? `&page=${page}` : ""}`,
  
  papersByType: (departmentId: string, paperType: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}?paperType=${paperType}`,
  generalPapersByType: (paperType: string) =>
    `${BUSINESS_API_BASE_URL}/papers/general?paperType=${paperType}`,
  paperDetail: (departmentId: string, paperId: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/${paperId}`,
  togglePaper: (paperId: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${paperId}/toggle`,
  paperAnswers: (departmentId: string, paperId: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/${paperId}/answers`,

  // Papers - Dashboard API
  createPaper: `${DASHBOARD_API_BASE_URL}/papers/create`,
  updatePaper: (paperId: string) =>
    `${DASHBOARD_API_BASE_URL}/papers/${paperId}`,
  deletePaper: (paperId: string) =>
    `${DASHBOARD_API_BASE_URL}/papers/${paperId}`,
  paperLogs: `${DASHBOARD_API_BASE_URL}/papers/stats`,

  // Users - Dashboard API
  users: `${DASHBOARD_API_BASE_URL}/users`,
  toggleUserStatus: (userId: string) =>
    `${DASHBOARD_API_BASE_URL}/users/${userId}/toggle`,
  grantAccess: `${DASHBOARD_API_BASE_URL}/users/grant-access`,
  revokeAccess: `${DASHBOARD_API_BASE_URL}/users/revoke-access`,
};
