import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@services/dashboardService';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { DashboardSummary } from '@customTypes/index';

export const useDashboardSummary = () => {
  const role = useSelector((state: RootState) => state.user.role);

  return useQuery<DashboardSummary, Error>({
    queryKey: ['dashboardSummary', role],
    queryFn: () => fetchDashboardSummary(role || ''),
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  });
};
