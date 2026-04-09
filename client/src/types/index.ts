/** 工具子分类 */
export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
  order?: number;
  icon?: string | null;
}

/** 工具分类（含子分类列表） */
export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId?: string | null;
  order?: number;
  children: SubCategory[];
}

/** 待审核工具 */
export interface PendingTool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string | null;
  contactInfo: string | null;
  categoryId: string | null;
  subCategoryId: string | null;
  status: string;
  createdAt: string;
}

export interface ToolCategoryAssignment {
  categoryId: string;
  subCategoryId: string | null;
}

/** AI 工具信息 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string | null;
  categoryId: string;
  subCategoryId: string | null;
  canonicalKey?: string | null;
  categoryAssignments: ToolCategoryAssignment[];
  tags: string[];
  views: number;
  isSponsored?: boolean;
  sponsorExpiry?: string | null;
  order?: number;
  createdAt?: string;
}
