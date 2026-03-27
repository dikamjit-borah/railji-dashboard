import { API_ENDPOINTS } from './api'
import { apiClient } from './api-client'

export interface User {
  _id: string
  username: string
  userId: string
  email: string
  createdAt: string
  updatedAt: string
  isActive?: boolean
  departments?: string[]
  papers?: string[]
}

export interface Department {
  departmentId: string
  name: string
  code?: string
  description?: string
  hasAccess?: boolean
}

export interface Paper {
  _id: string
  paperId: string
  paperCode: string | null
  name: string
  title: string
  description?: string
  departmentId: string
  year?: number
  shift?: string
  zones?: string
  examType?: string
  totalQuestions?: number
  duration?: number
  passPercentage?: number
  negativeMarking?: number
  rating?: number
  isFree?: boolean
  isNew?: boolean
  isActive?: boolean
  paperType?: string
  usersAttempted?: number
  createdAt?: string
  updatedAt?: string
  hasAccess?: boolean
}

export interface UserAccessUpdate {
  type: 'department' | 'paper'
  resourceId: string
  action: 'add' | 'remove'
}

interface GrantAccessPayload {
  userId: string
  departmentId?: string
  paperId?: string
  description?: string
  paymentRef?: string
  paymentGateway?: string
}

export class UsersAPI {
  static async getUsers(): Promise<{ success: boolean; data: { users: User[] } }> {
    const result = await apiClient.get(API_ENDPOINTS.users);
    if (!result.success) {
      return { success: false, data: { users: [] } };
    }
    return result as { success: boolean; data: { users: User[] } };
  }

  static async getUserById(userId: string): Promise<{ success: boolean; data: { user: User } }> {
    try {
      // Try to get individual user first
      const result = await apiClient.get(`${API_ENDPOINTS.users}/${userId}`);
      if (result.success) {
        return result as { success: boolean; data: { user: User } };
      }
      
      // Fallback: get all users and find the specific one
      const allUsersResult = await apiClient.get(API_ENDPOINTS.users);
      
      if (allUsersResult.success && allUsersResult.data?.users) {
        const user = allUsersResult.data.users.find((u: User) => u._id === userId);
        if (user) {
          return {
            success: true,
            data: { user }
          };
        }
      }
      
      return {
        success: false,
        data: { user: null as any }
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        data: { user: null as any }
      };
    }
  }

  static async toggleUserStatus(userId: string): Promise<{ success: boolean }> {
    const result = await apiClient.patch(API_ENDPOINTS.toggleUserStatus(userId));
    return { success: result.success };
  }

  static async getUserDepartments(userId: string): Promise<{ success: boolean; data: { departments: string[] } }> {
    try {
      const result = await apiClient.get(API_ENDPOINTS.userDepartments(userId));
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            departments: result.data.departments || []
          }
        };
      }
      return {
        success: false,
        data: { departments: [] }
      };
    } catch (error) {
      console.error('Error fetching user departments:', error);
      return {
        success: false,
        data: { departments: [] }
      };
    }
  }

  static async getUserPapers(userId: string): Promise<{ success: boolean; data: { papers: string[] } }> {
    try {
      const result = await apiClient.get(API_ENDPOINTS.userPapers(userId));
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            papers: result.data.papers || []
          }
        };
      }
      return {
        success: false,
        data: { papers: [] }
      };
    } catch (error) {
      console.error('Error fetching user papers:', error);
      return {
        success: false,
        data: { papers: [] }
      };
    }
  }

  static async updateUserAccess(userId: string, update: UserAccessUpdate): Promise<{ success: boolean; message?: string }> {
    try {
      // Only handle 'add' action for now (grant-access API)
      // revoke-access API will be integrated later
      if (update.action === 'remove') {
        console.warn('Revoke access API not yet integrated');
        return { 
          success: false, 
          message: 'Revoke access will be available soon' 
        };
      }

      const payload: GrantAccessPayload = {
        userId: userId,
        description: `Grant ${update.type} access`
      };

      // Add departmentId or paperId based on type
      if (update.type === 'department') {
        payload.departmentId = update.resourceId;
      } else if (update.type === 'paper') {
        payload.paperId = update.resourceId;
      }

      const result = await apiClient.post(API_ENDPOINTS.grantAccess, payload);
      
      return { 
        success: result.success,
        message: result.message || (result.success ? 'Access granted successfully' : 'Failed to grant access')
      };
    } catch (error) {
      console.error('Error granting user access:', error);
      return { 
        success: false,
        message: error instanceof Error ? error.message : 'Error granting user access'
      };
    }
  }

  static async getDepartments(userId?: string): Promise<{ success: boolean; data: { departments: Department[] } }> {
    try {
      const url = userId 
        ? `${API_ENDPOINTS.departments}`
        : API_ENDPOINTS.departments;
      
      const result = await apiClient.get(url);
      
      // Handle different response formats like PapersSection does
      let depts: Department[] = [];
      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          depts = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          depts = result.data.data;
        } else if (result.data.departments && Array.isArray(result.data.departments)) {
          depts = result.data.departments;
        } else {
          console.error('Unexpected departments response format:', result.data);
          depts = [];
        }
      }
      
      // Add General Papers as a special department at the top like PapersSection does
      const generalDept: Department = {
        departmentId: 'GENERAL',
        name: 'General Papers',
        description: 'Common papers across all departments',
        hasAccess: false // Default to no access for general
      };
      
      const allDepts = [generalDept, ...depts];
      
      return {
        success: result.success,
        data: { departments: allDepts }
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return {
        success: false,
        data: { departments: [] }
      };
    }
  }

  static async getPapersForDepartment(departmentId: string, userId?: string): Promise<{ success: boolean; data: { papers: Paper[] } }> {
    try {
      let baseUrl;
      
      // Handle general papers separately like PapersSection does
      if (departmentId === 'GENERAL') {
        baseUrl = API_ENDPOINTS.generalPapers();
      } else {
        baseUrl = API_ENDPOINTS.papers(departmentId);
      }
      
      const result = await apiClient.get(baseUrl);
      
      // Handle different response formats like PapersSection does
      let papers: Paper[] = [];
      if (result.success && result.data) {
        if (result.data.papers && Array.isArray(result.data.papers)) {
          papers = result.data.papers;
        } else if (Array.isArray(result.data)) {
          papers = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          papers = result.data.data;
        } else {
          console.error('Unexpected papers response format:', result.data);
          papers = [];
        }
      }
      
      return {
        success: result.success,
        data: { papers }
      };
    } catch (error) {
      console.error(`Error fetching papers for department ${departmentId}:`, error);
      return {
        success: false,
        data: { papers: [] }
      };
    }
  }
}