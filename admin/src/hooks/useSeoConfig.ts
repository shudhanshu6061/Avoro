import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface SeoRedirect {
  id: string;
  from: string;
  to: string;
  type: '301' | '302' | '410';
  date: string;
  hits: number;
}

export interface PageSeoConfig {
  id: string;
  path: string;
  pageName: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaType?: string;
  updatedAt?: string;
}

export interface SeoConfig {
  robots: string;
  sitemap: {
    autoGenerate: boolean;
    types: { label: string; include: boolean; freq: string; priority: string }[];
    lastRegen: string | null;
  };
  redirects: SeoRedirect[];
  cwv: {
    metrics: { label: string; value: string; unit: string }[];
    lastTested: string;
    notes: string;
  };
  gsc: { verificationCode: string };
  duplicate: { preferredDomain: 'www' | 'non-www'; forceHttps: boolean };
  pages?: PageSeoConfig[];
}

export function useSeoConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<SeoConfig>({
    queryKey: ['seo-config'],
    queryFn: () => api.get('/admin/seo').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (next: SeoConfig) => api.put('/admin/seo', { config: next }).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['seo-config'], data);
      toast.success('SEO settings saved');
    },
    onError: () => toast.error('Failed to save SEO settings'),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => api.post('/admin/seo/regenerate-sitemap').then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-config'] });
      toast.success('Sitemap regenerated');
    },
    onError: () => toast.error('Failed to regenerate sitemap'),
  });

  const scanMutation = useMutation({
    mutationFn: () => api.post('/admin/seo/scan-duplicates').then((r) => r.data),
    onError: () => toast.error('Scan failed'),
  });

  const save = async (patch: Partial<SeoConfig>) => {
    if (!config) return;
    await saveMutation.mutateAsync({ ...config, ...patch });
  };

  return {
    config,
    isLoading,
    save,
    saving: saveMutation.isPending,
    regenerate: regenerateMutation.mutateAsync,
    regenerating: regenerateMutation.isPending,
    scan: scanMutation.mutateAsync,
    scanResult: scanMutation.data,
    scanning: scanMutation.isPending,
  };
}