const BUSINESS_API_BASE_URL = 'https://railji-business.onrender.com/business/v1'
const DASHBOARD_API_BASE_URL = 'https://railji-dashboard.onrender.com/dashboard/v1'

export const API_ENDPOINTS = {
  // Departments
  departments: `${BUSINESS_API_BASE_URL}/departments`,
  
  // Papers - Business API (Read operations)
  papers: (departmentId: string, page?: number) => 
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}${page ? `?page=${page}` : ''}`,
  generalPapers: (page?: number) => 
    `${BUSINESS_API_BASE_URL}/papers/GENERAL?paperType=general${page ? `&page=${page}` : ''}`,
  papersByType: (departmentId: string, paperType: string) => 
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}?paperType=${paperType}`,
  generalPapersByType: (paperType: string) => 
    `${BUSINESS_API_BASE_URL}/papers/general?paperType=${paperType}`,
  paperDetail: (departmentId: string, paperId: string) => 
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/${paperId}`,
  togglePaper: (paperId: string) => `${BUSINESS_API_BASE_URL}/papers/${paperId}/toggle`,
   paperAnswers: (departmentId: string, paperId: string) => 
    `${BUSINESS_API_BASE_URL}/papers/${departmentId}/${paperId}/answers`,
   
  // Papers - Dashboard API (Write operations)
  createPaper: `${DASHBOARD_API_BASE_URL}/papers/create`,
  updatePaper: (paperId: string) => `${DASHBOARD_API_BASE_URL}/papers/${paperId}`,
  deletePaper: (paperId: string) => `${DASHBOARD_API_BASE_URL}/papers/${paperId}`,
}
