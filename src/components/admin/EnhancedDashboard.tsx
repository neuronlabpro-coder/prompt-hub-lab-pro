import { TrendingUp, TrendingDown, Users, FileText, DollarSign, Eye, Copy, Activity, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatNumber } from '../../lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalPrompts: number;
  totalRevenue: number;
  activeUsers: number;
  promptViews: number;
  promptCopies: number;
  avgCTR: number;
  topPrompts: Array<{
    id: string;
    title: string;
    views: number;
    copies: number;
    ctr: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    user: string;
    prompt: string;
    timestamp: string;
  }>;
}

interface EnhancedDashboardProps {
  stats: DashboardStats;
}

export function EnhancedDashboard({ stats }: EnhancedDashboardProps) {
  const statCards = [
    {
      title: 'Total Usuarios',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-500',
    },
    {
      title: 'Total Prompts',
      value: formatNumber(stats.totalPrompts),
      icon: FileText,
      trend: '+24%',
      trendUp: true,
      color: 'text-green-500',
    },
    {
      title: 'Ingresos Totales',
      value: `$${formatNumber(stats.totalRevenue)}`,
      icon: DollarSign,
      trend: '+8%',
      trendUp: true,
      color: 'text-yellow-500',
    },
    {
      title: 'Usuarios Activos',
      value: formatNumber(stats.activeUsers),
      icon: Activity,
      trend: '+5%',
      trendUp: true,
      color: 'text-purple-500',
    },
    {
      title: 'Vistas de Prompts',
      value: formatNumber(stats.promptViews),
      icon: Eye,
      trend: '+18%',
      trendUp: true,
      color: 'text-orange-500',
    },
    {
      title: 'Copias de Prompts',
      value: formatNumber(stats.promptCopies),
      icon: Copy,
      trend: '+15%',
      trendUp: true,
      color: 'text-pink-500',
    },
    {
      title: 'CTR Promedio',
      value: `${stats.avgCTR.toFixed(2)}%`,
      icon: TrendingUp,
      trend: '+3%',
      trendUp: true,
      color: 'text-cyan-500',
    },
    {
      title: 'Prompts Destacados',
      value: formatNumber(stats.topPrompts.length),
      icon: Star,
      trend: '0%',
      trendUp: false,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Dashboard de Estadísticas</h2>
        <Badge variant="secondary">Actualizado hace 5 min</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400" data-testid={`text-stat-title-${index}`}>{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-100 mt-1" data-testid={`text-stat-value-${index}`}>{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-2 ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="text-xs">{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-800 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Prompts por Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topPrompts.map((prompt, index) => (
              <div key={prompt.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg" data-testid={`top-prompt-${index}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{prompt.title}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(prompt.views)} vistas
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        {formatNumber(prompt.copies)} copias
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{prompt.ctr.toFixed(2)}% CTR</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg" data-testid={`activity-${activity.id}`}>
                <div className={`p-2 rounded-lg ${
                  activity.type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'copy' ? 'bg-green-500/20 text-green-400' :
                  activity.type === 'purchase' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {activity.type === 'view' && <Eye className="h-4 w-4" />}
                  {activity.type === 'copy' && <Copy className="h-4 w-4" />}
                  {activity.type === 'purchase' && <DollarSign className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-100">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    {activity.type === 'view' && 'vio'}
                    {activity.type === 'copy' && 'copió'}
                    {activity.type === 'purchase' && 'compró'}
                    {' '}
                    <span className="text-blue-400">{activity.prompt}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Crecimiento (Últimos 7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Gráfico de análisis disponible próximamente</p>
              <p className="text-sm text-gray-500 mt-1">Integración con Chart.js en desarrollo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
