export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  children: SubCategory[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  categoryId: string;
  subCategoryId: string;
  tags: string[];
  views: number;
}
