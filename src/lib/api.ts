// Base URLs come from environment variables (for Next.js use NEXT_PUBLIC_*)
const BUSINESS_API_BASE_URL =
  process.env.NEXT_PUBLIC_BUSINESS_API_BASE_URL ||
  "http://localhost:3001/business/v1";
const DASHBOARD_API_BASE_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_BASE_URL ||
  "http://localhost:3002/dashboard/v1";

export const API_ENDPOINTS = {
  // Auth
  signIn: `${DASHBOARD_API_BASE_URL}/users/login`,

  // Departments
  departments: `${BUSINESS_API_BASE_URL}/departments`,
  
  // Departments with userId (for user access management)
  userDepartments: (userId: string) =>
    `${BUSINESS_API_BASE_URL}/departments/user/${userId}`,

  // Papers - Business API
  papers: (departmentId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}${page ? `?page=${page}` : ""}`,
  generalPapers: (page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/general?paperType=general${page ? `&page=${page}` : ""}`,
  
  // Papers with userId (for user access management)
  userPapers: (userId: string, departmentId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/user/${userId}${page ? `?page=${page}` : ""}`,
  userGeneralPapers: (userId: string, page?: number) =>
    `${BUSINESS_API_BASE_URL}/papers/general/user/${userId}?paperType=general${page ? `&page=${page}` : ""}`,
  
  papersByType: (departmentId: string, paperType: string, designation?: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}?paperType=${paperType}${designation ? `&designation=${encodeURIComponent(designation)}` : ''}`,
  generalPapersByType: (paperType: string) =>
    `${BUSINESS_API_BASE_URL}/papers/general?paperType=${paperType}`,
  departmentDesignations: (departmentId: string) =>
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}?paperType=sectional`,
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

  // Subscriptions - Dashboard API
  subscriptions: (page?: number, limit?: number) =>
    `${DASHBOARD_API_BASE_URL}/users/subscriptions?page=${page || 1}&limit=${limit || 10}`,
};
